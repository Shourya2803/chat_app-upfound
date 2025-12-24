import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
    args: {
        chatId: v.id("chats"),
        senderId: v.id("users"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            chatId: args.chatId,
            senderId: args.senderId,
            content: args.content,
            createdAt: Date.now(),
        });
    },
});

export const list = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .order("asc")
            .collect();
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


