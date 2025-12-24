import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateChat = mutation({
    args: { userId1: v.id("users"), userId2: v.id("users") },
    handler: async (ctx, args) => {
        const sortedParticipants = [args.userId1, args.userId2].sort();

        const existingChat = await ctx.db
            .query("chats")
            .withIndex("by_participants", (q) => q.eq("participants", sortedParticipants))
            .unique();

        if (existingChat) {
            return existingChat._id;
        }

        return await ctx.db.insert("chats", {
            participants: sortedParticipants,
            createdAt: Date.now(),
        });
    },
});

export const getChatDetails = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.chatId);
    },
});
