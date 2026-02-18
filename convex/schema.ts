import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Prayer requests and intentions
  prayers: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    prayerType: v.string(), // "gratitude", "petition", "intercession", "confession", "praise"
    isAnswered: v.boolean(),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_public", ["isPublic"]),

  // Daily devotional entries
  devotionals: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    verse: v.string(),
    reflection: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  // Spiritual journal entries
  journalEntries: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    mood: v.string(), // "hopeful", "grateful", "struggling", "peaceful", "seeking"
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Search history for Grok queries
  searchHistory: defineTable({
    userId: v.id("users"),
    query: v.string(),
    response: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Community prayer wall (public prayers others can pray for)
  prayerWall: defineTable({
    userId: v.id("users"),
    userName: v.optional(v.string()),
    intention: v.string(),
    prayerCount: v.number(), // How many people have prayed for this
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
