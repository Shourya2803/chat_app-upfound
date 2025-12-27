import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const register = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .unique();

        if (existingUser) {
            // Re-login existing user
            await ctx.db.patch(existingUser._id, {
                online: true,
                lastSeen: Date.now()
            });
            return existingUser._id;
        }

        const userId = await ctx.db.insert("users", {
            name: args.name,
            online: true,
            lastSeen: Date.now(),
            createdAt: Date.now(),
        });

        return userId;
    },
});

export const heartbeat = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return;
        await ctx.db.patch(args.userId, {
            lastSeen: Date.now(),
            online: true
        });
    },
});

export const logout = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { online: false });
    },
});

export const listAllExcept = query({
    args: { currentUserId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const users = await ctx.db.query("users").collect();
        const now = Date.now();

        if (!args.currentUserId) {
            return users.map(u => ({
                ...u,
                online: u.online && (now - u.lastSeen < 30000)
            }));
        }

        const result = [];
        for (const u of users) {
            if (u._id === args.currentUserId) continue;

            // Get chat between current user and this user
            const sortedParticipants = [args.currentUserId, u._id].sort();
            const chat = await ctx.db
                .query("chats")
                .withIndex("by_participants", (q) => q.eq("participants", sortedParticipants))
                .unique();

            let pinnedAt = undefined;
            let chatId = undefined;

            if (chat) {
                chatId = chat._id;
                const pin = await ctx.db
                    .query("pinnedChats")
                    .withIndex("by_userId_chatId", (q) =>
                        q.eq("userId", args.currentUserId!).eq("chatId", chat._id)
                    )
                    .unique();
                pinnedAt = pin?.pinnedAt;
            }

            result.push({
                ...u,
                online: u.online && (now - u.lastSeen < 30000),
                pinnedAt,
                chatId
            });
        }

        // Sort: Pinned first (by pinnedAt desc), then by name
        return result.sort((a, b) => {
            if (a.pinnedAt && b.pinnedAt) return b.pinnedAt - a.pinnedAt;
            if (a.pinnedAt) return -1;
            if (b.pinnedAt) return 1;
            return a.name.localeCompare(b.name);
        });
    },
});

export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;
        const now = Date.now();
        return {
            ...user,
            online: user.online && (now - user.lastSeen < 30000)
        };
    },
});

export const cleanupOfflineUsers = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const threshold = now - 60000; // 1 minute
        const staleUsers = await ctx.db
            .query("users")
            .filter((q) => q.and(
                q.eq(q.field("online"), true),
                q.lt(q.field("lastSeen"), threshold)
            ))
            .collect();

        for (const user of staleUsers) {
            await ctx.db.patch(user._id, { online: false });
        }
    },
});


