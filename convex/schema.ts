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
  })
    .index("by_chatId", ["chatId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["chatId"],
    }),

  typing: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_chatId", ["chatId"]),
});
