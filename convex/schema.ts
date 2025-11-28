import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // User preferences
  preferences: defineTable({
    userId: v.id("users"),
    defaultView: v.union(v.literal("grid"), v.literal("list")),
    defaultSort: v.union(
      v.literal("dateAdded"),
      v.literal("clickCount"),
      v.literal("rating"),
      v.literal("title")
    ),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Categories (flat structure - AI, Tools, Social, etc.)
  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(), // hex color for the category
    icon: v.string(), // icon name
    order: v.number(), // for custom ordering
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Folders (legacy - kept for migration)
  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    isPublic: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .index("by_user_and_parent", ["userId", "parentId"]),

  // Websites (saved URLs)
  websites: defineTable({
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")), // New: category assignment
    folderId: v.optional(v.id("folders")), // Legacy: keep for migration
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    clickCount: v.number(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["categoryId"])
    .index("by_folder", ["folderId"])
    .index("by_user_and_folder", ["userId", "folderId"])
    .index("by_tags", ["tags"]),

  // Ratings for websites
  ratings: defineTable({
    userId: v.id("users"),
    websiteId: v.id("websites"),
    rating: v.number(), // 1-5 stars
    usefulness: v.optional(v.number()), // 1-5 scale
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_website", ["websiteId"])
    .index("by_user_and_website", ["userId", "websiteId"]),

  // Sessions for authentication
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
