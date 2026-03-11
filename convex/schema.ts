import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

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

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

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

  websites: defineTable({
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    folderId: v.optional(v.id("folders")),
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

  ratings: defineTable({
    userId: v.id("users"),
    websiteId: v.id("websites"),
    rating: v.number(),
    usefulness: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_website", ["websiteId"])
    .index("by_user_and_website", ["userId", "websiteId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
