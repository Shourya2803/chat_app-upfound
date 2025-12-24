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

        return users
            .filter((u) => u._id !== args.currentUserId)
            .map((u) => ({
                ...u,
                // A user is "online" if they have the online flag AND were seen recently
                online: u.online && (now - u.lastSeen < 30000)
            }));
    },
});

export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
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


