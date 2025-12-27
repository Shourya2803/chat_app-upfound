import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
    args: {
        chatId: v.id("chats"),
        senderId: v.id("users"),
        content: v.string(),
        fileUrl: v.optional(v.string()),
        fileType: v.optional(v.string()),
        fileName: v.optional(v.string()),
        fileSize: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        console.log("Saving message with file:", {
            chatId: args.chatId,
            senderId: args.senderId,
            fileUrl: args.fileUrl,
            fileType: args.fileType
        });
        await ctx.db.insert("messages", {
            chatId: args.chatId,
            senderId: args.senderId,
            content: args.content,
            createdAt: Date.now(),
            fileUrl: args.fileUrl,
            fileType: args.fileType,
            fileName: args.fileName,
            fileSize: args.fileSize,
            deletedForEveryone: false,
        });
    },
});

export const list = query({
    args: { chatId: v.id("chats"), currentUserId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .order("asc")
            .collect();

        return messages.filter(msg => {
            // Hide if deleted for this user
            if (args.currentUserId && msg.deletedForUserIds?.includes(args.currentUserId)) {
                return false;
            }
            return true;
        }).map(msg => {
            if (msg.fileUrl) {
                console.log("Query: Found message with file:", {
                    id: msg._id,
                    url: msg.fileUrl,
                    type: msg.fileType
                });
            }
            if (msg.deletedForEveryone) {
                return {
                    ...msg,
                    content: "This message was deleted for everyone.",
                    fileUrl: undefined,
                    fileType: undefined,
                    fileName: undefined,
                    fileSize: undefined,
                };
            }
            return msg;
        });
    },
});

export const deleteForMe = mutation({
    args: { messageId: v.id("messages"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) return;

        const deletedForUserIds = message.deletedForUserIds || [];
        if (!deletedForUserIds.includes(args.userId)) {
            await ctx.db.patch(args.messageId, {
                deletedForUserIds: [...deletedForUserIds, args.userId]
            });
        }
    },
});

export const deleteForEveryone = mutation({
    args: { messageId: v.id("messages"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) return;

        // Check if sender is the one deleting
        if (message.senderId !== args.userId) {
            throw new Error("Only the sender can delete this message for everyone.");
        }

        // Check 10 minute window
        const tenMinutes = 10 * 60 * 1000;
        if (Date.now() - message.createdAt > tenMinutes) {
            throw new Error("Messages can only be deleted for everyone within 10 minutes.");
        }

        await ctx.db.patch(args.messageId, {
            deletedForEveryone: true,
            deletedAt: Date.now()
        });
    },
});

export const setTyping = mutation({
    args: {
        chatId: v.id("chats"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typing")
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .unique();

        const expiresAt = Date.now() + 3000;

        if (existing) {
            await ctx.db.patch(existing._id, { expiresAt });
        } else {
            await ctx.db.insert("typing", {
                chatId: args.chatId,
                userId: args.userId,
                expiresAt,
            });
        }
    },
});

export const getTypingIndicators = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("typing")
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .collect();
    },
});

export const cleanupOldTypingIndicators = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expiredTyping = await ctx.db
            .query("typing")
            .filter((q) => q.lt(q.field("expiresAt"), now))
            .collect();

        for (const t of expiredTyping) {
            await ctx.db.delete(t._id);
        }
    },
});

export const search = query({
    args: { chatId: v.id("chats"), query: v.string() },
    handler: async (ctx, args) => {
        if (!args.query) return [];

        return await ctx.db
            .query("messages")
            .withSearchIndex("search_content", (q) =>
                q.search("content", args.query).eq("chatId", args.chatId)
            )
            .take(10);
    },
});


