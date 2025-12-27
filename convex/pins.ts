import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const pinChat = mutation({
    args: { userId: v.id("users"), chatId: v.id("chats") },
    handler: async (ctx, args) => {
        // Check if already pinned
        const existing = await ctx.db
            .query("pinnedChats")
            .withIndex("by_userId_chatId", (q) =>
                q.eq("userId", args.userId).eq("chatId", args.chatId)
            )
            .unique();

        if (existing) return;

        // Check limit
        const pinnedCount = await ctx.db
            .query("pinnedChats")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        if (pinnedCount.length >= 3) {
            throw new Error("You can only pin up to 3 chats.");
        }

        await ctx.db.insert("pinnedChats", {
            userId: args.userId,
            chatId: args.chatId,
            pinnedAt: Date.now(),
        });
    },
});

export const unpinChat = mutation({
    args: { userId: v.id("users"), chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("pinnedChats")
            .withIndex("by_userId_chatId", (q) =>
                q.eq("userId", args.userId).eq("chatId", args.chatId)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
