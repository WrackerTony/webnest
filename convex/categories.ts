import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper to verify authentication
async function verifyAuth(ctx: { db: any }, token: string): Promise<Id<"users">> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Not authenticated");
  }

  return session.userId;
}

// Input validation helpers
function sanitizeText(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== "string") return "";
  return text.trim().slice(0, maxLength).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// Valid color format check (hex color)
function isValidColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Valid icon values
const VALID_ICONS = ["folder", "ai", "tools", "social", "dev", "news", "shopping", "entertainment", "education", "star"];

function isValidIcon(icon: string): boolean {
  return VALID_ICONS.includes(icon);
}

// Create a new category
export const create = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    // Validate and sanitize inputs
    const name = sanitizeText(args.name, 50);
    if (!name || name.length === 0) {
      throw new Error("Category name is required");
    }

    // Validate color
    const color = args.color && isValidColor(args.color) ? args.color : "#8b5cf6";
    
    // Validate icon
    const icon = args.icon && isValidIcon(args.icon) ? args.icon : "folder";

    // Check if category with same name exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    if (existing.some((c: any) => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Category already exists");
    }

    // Limit number of categories per user
    if (existing.length >= 50) {
      throw new Error("Maximum number of categories reached");
    }

    // Get the highest order number
    const maxOrder = existing.reduce((max: number, c: any) => Math.max(max, c.order), -1);

    const now = Date.now();
    const categoryId = await ctx.db.insert("categories", {
      userId,
      name,
      color,
      icon,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return categoryId;
  },
});

// Get all categories for a user
export const list = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    // Get website count for each category
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const countMap = new Map<string, number>();
    for (const w of websites) {
      if (w.categoryId) {
        countMap.set(w.categoryId.toString(), (countMap.get(w.categoryId.toString()) || 0) + 1);
      }
    }

    return categories
      .map((c: any) => ({
        ...c,
        websiteCount: countMap.get(c._id.toString()) || 0,
      }))
      .sort((a: any, b: any) => a.order - b.order);
  },
});

// Get a single category
export const get = query({
  args: {
    token: v.string(),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      return null;
    }

    return category;
  },
});

// Update a category
export const update = mutation({
  args: {
    token: v.string(),
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    
    // Validate and sanitize inputs
    if (args.name !== undefined) {
      const name = sanitizeText(args.name, 50);
      if (!name || name.length === 0) {
        throw new Error("Category name is required");
      }
      updates.name = name;
    }
    
    if (args.color !== undefined) {
      if (!isValidColor(args.color)) {
        throw new Error("Invalid color format");
      }
      updates.color = args.color;
    }
    
    if (args.icon !== undefined) {
      if (!isValidIcon(args.icon)) {
        throw new Error("Invalid icon");
      }
      updates.icon = args.icon;
    }

    await ctx.db.patch(args.categoryId, updates);
    return { success: true };
  },
});

// Delete a category
export const remove = mutation({
  args: {
    token: v.string(),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    // Set categoryId to undefined for all websites in this category
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_category", (q: any) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const website of websites) {
      await ctx.db.patch(website._id, { categoryId: undefined });
    }

    await ctx.db.delete(args.categoryId);

    return { success: true };
  },
});

// Reorder categories
export const reorder = mutation({
  args: {
    token: v.string(),
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    for (let i = 0; i < args.categoryIds.length; i++) {
      const category = await ctx.db.get(args.categoryIds[i]);
      if (category && category.userId === userId) {
        await ctx.db.patch(args.categoryIds[i], {
          order: i,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
