import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  chats: defineTable({
    participants: v.array(v.id("users")),
    createdAt: v.number(),
  }).index("by_participants", ["participants"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    // deletion fields
    deletedForEveryone: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    deletedForUserIds: v.optional(v.array(v.id("users"))),
    // file fields
    fileUrl: v.optional(v.string()),
    fileType: v.optional(v.string()), // 'image', 'video', 'pdf'
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  })
    .index("by_chatId", ["chatId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["chatId"],
    }),

  pinnedChats: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    pinnedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_chatId", ["userId", "chatId"]),

  typing: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_chatId", ["chatId"]),
});
