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
function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text || typeof text !== "string") return "";
  return text.trim().slice(0, maxLength).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Invalid URL protocol");
  }
  return parsed.href;
}

function sanitizeTags(tags: string[] | undefined): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  return tags
    .filter((tag) => typeof tag === "string")
    .map((tag) => sanitizeText(tag, 50).toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 20);
}

// Create a new website
export const create = mutation({
  args: {
    token: v.string(),
    categoryId: v.optional(v.id("categories")),
    folderId: v.optional(v.id("folders")), // Legacy support
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    // Validate and sanitize inputs
    if (!validateUrl(args.url)) {
      throw new Error("Invalid URL format");
    }

    const url = sanitizeUrl(args.url);
    const title = sanitizeText(args.title, 200);
    const description = args.description ? sanitizeText(args.description, 1000) : undefined;
    const tags = sanitizeTags(args.tags);

    if (!title || title.length === 0) {
      throw new Error("Title is required");
    }

    // Validate favicon URL if provided
    let faviconUrl = args.faviconUrl;
    if (faviconUrl) {
      if (!validateUrl(faviconUrl)) {
        faviconUrl = undefined; // Ignore invalid favicon URLs
      } else {
        faviconUrl = sanitizeUrl(faviconUrl);
      }
    }

    // Verify category belongs to user if provided
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.userId !== userId) {
        throw new Error("Category not found");
      }
    }

    // Legacy: verify folder belongs to user if provided
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found");
      }
    }

    // Get the highest order number
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const maxOrder = websites.reduce((max: number, w: any) => Math.max(max, w.order), -1);

    const now = Date.now();
    const websiteId = await ctx.db.insert("websites", {
      userId,
      categoryId: args.categoryId,
      folderId: args.folderId,
      url,
      title,
      description,
      faviconUrl,
      tags,
      clickCount: 0,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return websiteId;
  },
});

// Get all websites for a user
export const list = query({
  args: {
    token: v.string(),
    sortBy: v.optional(v.union(
      v.literal("dateAdded"),
      v.literal("clickCount"),
      v.literal("rating"),
      v.literal("title")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    // Get ratings for sorting if needed
    if (args.sortBy === "rating") {
      const ratings = await ctx.db
        .query("ratings")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();

      const ratingMap = new Map();
      for (const r of ratings) {
        ratingMap.set(r.websiteId.toString(), r.rating);
      }

      return websites
        .map((w: any) => ({
          ...w,
          rating: ratingMap.get(w._id.toString()) ?? 0,
        }))
        .sort((a: any, b: any) => b.rating - a.rating);
    }

    // Sort based on sortBy parameter
    switch (args.sortBy) {
      case "clickCount":
        return websites.sort((a: any, b: any) => b.clickCount - a.clickCount);
      case "title":
        return websites.sort((a: any, b: any) => a.title.localeCompare(b.title));
      case "dateAdded":
      default:
        return websites.sort((a: any, b: any) => b.createdAt - a.createdAt);
    }
  },
});

// Get websites in a specific category
export const getByCategory = query({
  args: {
    token: v.string(),
    categoryId: v.optional(v.id("categories")),
    sortBy: v.optional(v.union(
      v.literal("dateAdded"),
      v.literal("clickCount"),
      v.literal("rating"),
      v.literal("title")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    let websites;
    if (args.categoryId) {
      // Verify category belongs to user
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.userId !== userId) {
        throw new Error("Category not found");
      }

      websites = await ctx.db
        .query("websites")
        .withIndex("by_category", (q: any) => q.eq("categoryId", args.categoryId))
        .collect();
    } else {
      // Get all websites (no category filter)
      websites = await ctx.db
        .query("websites")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();
    }

    // Get ratings for all websites
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const ratingMap = new Map();
    for (const r of ratings) {
      ratingMap.set(r.websiteId.toString(), r);
    }

    const websitesWithRatings = websites.map((w: any) => ({
      ...w,
      rating: ratingMap.get(w._id.toString())?.rating ?? 0,
      usefulness: ratingMap.get(w._id.toString())?.usefulness ?? 0,
    }));

    // Sort based on sortBy parameter
    switch (args.sortBy) {
      case "clickCount":
        return websitesWithRatings.sort((a: any, b: any) => b.clickCount - a.clickCount);
      case "rating":
        return websitesWithRatings.sort((a: any, b: any) => b.rating - a.rating);
      case "title":
        return websitesWithRatings.sort((a: any, b: any) => a.title.localeCompare(b.title));
      case "dateAdded":
      default:
        return websitesWithRatings.sort((a: any, b: any) => b.createdAt - a.createdAt);
    }
  },
});

// Get websites in a specific folder (legacy)
export const getByFolder = query({
  args: {
    token: v.string(),
    folderId: v.id("folders"),
    sortBy: v.optional(v.union(
      v.literal("dateAdded"),
      v.literal("clickCount"),
      v.literal("rating"),
      v.literal("title")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    // Verify folder access
    const folder = await ctx.db.get(args.folderId);
    if (!folder || (folder.userId !== userId && !folder.isPublic)) {
      throw new Error("Folder not found or access denied");
    }

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_folder", (q: any) => q.eq("folderId", args.folderId))
      .collect();

    // Get ratings for all websites
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const ratingMap = new Map();
    for (const r of ratings) {
      ratingMap.set(r.websiteId.toString(), r);
    }

    const websitesWithRatings = websites.map((w: any) => ({
      ...w,
      rating: ratingMap.get(w._id.toString())?.rating ?? 0,
      usefulness: ratingMap.get(w._id.toString())?.usefulness ?? 0,
    }));

    // Sort based on sortBy parameter
    switch (args.sortBy) {
      case "clickCount":
        return websitesWithRatings.sort((a: any, b: any) => b.clickCount - a.clickCount);
      case "rating":
        return websitesWithRatings.sort((a: any, b: any) => b.rating - a.rating);
      case "title":
        return websitesWithRatings.sort((a: any, b: any) => a.title.localeCompare(b.title));
      case "dateAdded":
      default:
        return websitesWithRatings.sort((a: any, b: any) => b.createdAt - a.createdAt);
    }
  },
});

// Get a single website
export const get = query({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website) return null;

    // Check ownership or category/folder access
    if (website.userId !== userId) {
      // Check folder access (legacy)
      if (website.folderId) {
        const folder = await ctx.db.get(website.folderId);
        if (!folder || !folder.isPublic) {
          throw new Error("Access denied");
        }
      } else {
        throw new Error("Access denied");
      }
    }

    // Get rating
    const rating = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_website", (q: any) => 
        q.eq("userId", userId).eq("websiteId", args.websiteId)
      )
      .first();

    return {
      ...website,
      rating: rating?.rating ?? 0,
      usefulness: rating?.usefulness ?? 0,
    };
  },
});

// Update a website
export const update = mutation({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website || website.userId !== userId) {
      throw new Error("Website not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.url !== undefined) updates.url = args.url;
    if (args.faviconUrl !== undefined) updates.faviconUrl = args.faviconUrl;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.websiteId, updates);
    return { success: true };
  },
});

// Move website to a different folder
export const move = mutation({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
    newFolderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website || website.userId !== userId) {
      throw new Error("Website not found");
    }

    // Verify new folder belongs to user
    const folder = await ctx.db.get(args.newFolderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    // Get max order in new folder
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_folder", (q: any) => q.eq("folderId", args.newFolderId))
      .collect();

    const maxOrder = websites.reduce((max: number, w: any) => Math.max(max, w.order), -1);

    await ctx.db.patch(args.websiteId, {
      folderId: args.newFolderId,
      order: maxOrder + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reorder websites in a folder
export const reorder = mutation({
  args: {
    token: v.string(),
    websiteIds: v.array(v.id("websites")),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    for (let i = 0; i < args.websiteIds.length; i++) {
      const website = await ctx.db.get(args.websiteIds[i]);
      if (website && website.userId === userId) {
        await ctx.db.patch(args.websiteIds[i], {
          order: i,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Delete a website
export const remove = mutation({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website || website.userId !== userId) {
      throw new Error("Website not found");
    }

    // Delete all ratings for this website
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_website", (q: any) => q.eq("websiteId", args.websiteId))
      .collect();

    for (const rating of ratings) {
      await ctx.db.delete(rating._id);
    }

    await ctx.db.delete(args.websiteId);

    return { success: true };
  },
});

// Increment click count
export const click = mutation({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website) {
      throw new Error("Website not found");
    }

    // Check ownership
    if (website.userId !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.websiteId, {
      clickCount: website.clickCount + 1,
    });

    return { success: true };
  },
});

// Rate a website
export const rate = mutation({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
    rating: v.number(),
    usefulness: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website) {
      throw new Error("Website not found");
    }

    // Check ownership
    if (website.userId !== userId) {
      throw new Error("Access denied");
    }

    // Check if rating exists
    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_website", (q: any) => 
        q.eq("userId", userId).eq("websiteId", args.websiteId)
      )
      .first();

    const now = Date.now();
    
    if (existingRating) {
      const updates: Record<string, unknown> = {
        rating: args.rating,
        updatedAt: now,
      };
      if (args.usefulness !== undefined) {
        updates.usefulness = args.usefulness;
      }
      await ctx.db.patch(existingRating._id, updates);
    } else {
      await ctx.db.insert("ratings", {
        userId,
        websiteId: args.websiteId,
        rating: args.rating,
        usefulness: args.usefulness,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Set category for a website
export const setCategory = mutation({
  args: {
    token: v.string(),
    websiteId: v.id("websites"),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const website = await ctx.db.get(args.websiteId);
    if (!website || website.userId !== userId) {
      throw new Error("Website not found");
    }

    // Verify category belongs to user if provided
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || category.userId !== userId) {
        throw new Error("Category not found");
      }
    }

    await ctx.db.patch(args.websiteId, {
      categoryId: args.categoryId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Search websites across all categories
export const search = query({
  args: {
    token: v.string(),
    query: v.string(),
    tags: v.optional(v.array(v.string())),
    minRating: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    folderId: v.optional(v.id("folders")), // Legacy support
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    let websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    // Filter by category if provided
    if (args.categoryId) {
      websites = websites.filter((w: any) => 
        w.categoryId && w.categoryId.toString() === args.categoryId!.toString()
      );
    }

    // Filter by folder if provided (legacy)
    if (args.folderId) {
      websites = websites.filter((w: any) => 
        w.folderId && w.folderId.toString() === args.folderId!.toString()
      );
    }

    // Filter by search query
    const queryLower = args.query.toLowerCase();
    websites = websites.filter((w: any) => 
      w.title.toLowerCase().includes(queryLower) ||
      w.url.toLowerCase().includes(queryLower) ||
      (w.description && w.description.toLowerCase().includes(queryLower)) ||
      w.tags.some((t: string) => t.toLowerCase().includes(queryLower))
    );

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      websites = websites.filter((w: any) =>
        args.tags!.some((tag: string) => 
          w.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    // Get ratings
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const ratingMap = new Map();
    for (const r of ratings) {
      ratingMap.set(r.websiteId.toString(), r);
    }

    // Add ratings to websites
    websites = websites.map((w: any) => ({
      ...w,
      rating: ratingMap.get(w._id.toString())?.rating ?? 0,
      usefulness: ratingMap.get(w._id.toString())?.usefulness ?? 0,
    }));

    // Filter by min rating if provided
    if (args.minRating !== undefined && args.minRating > 0) {
      websites = websites.filter((w: any) => w.rating >= args.minRating!);
    }

    // Sort by relevance (title matches first, then by date)
    websites.sort((a: any, b: any) => {
      const aTitle = a.title.toLowerCase().includes(queryLower);
      const bTitle = b.title.toLowerCase().includes(queryLower);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return b.createdAt - a.createdAt;
    });

    return websites;
  },
});

// Get public folder websites
export const getPublicWebsites = query({
  args: {
    folderId: v.id("folders"),
    sortBy: v.optional(v.union(
      v.literal("dateAdded"),
      v.literal("clickCount"),
      v.literal("title")
    )),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder || !folder.isPublic) {
      return [];
    }

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_folder", (q: any) => q.eq("folderId", args.folderId))
      .collect();

    switch (args.sortBy) {
      case "clickCount":
        return websites.sort((a: any, b: any) => b.clickCount - a.clickCount);
      case "title":
        return websites.sort((a: any, b: any) => a.title.localeCompare(b.title));
      case "dateAdded":
      default:
        return websites.sort((a: any, b: any) => b.createdAt - a.createdAt);
    }
  },
});

// Get all tags for a user
export const getAllTags = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const tagSet = new Set<string>();
    for (const website of websites) {
      for (const tag of website.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
  },
});
