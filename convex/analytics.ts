import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

export const getOverview = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const totalWebsites = websites.length;
    const totalFolders = folders.length;
    const totalClicks = websites.reduce((sum: number, w: any) => sum + w.clickCount, 0);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      : 0;

    const tagCounts: Record<string, number> = {};
    for (const website of websites) {
      for (const tag of website.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentlyAdded = websites.filter((w: any) => w.createdAt > thirtyDaysAgo).length;

    return {
      totalWebsites,
      totalFolders,
      totalClicks,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      topTags,
      recentlyAdded,
    };
  },
});

export const getMostClicked = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);
    const limit = args.limit ?? 10;

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    return websites
      .sort((a: any, b: any) => b.clickCount - a.clickCount)
      .slice(0, limit);
  },
});

export const getHighestRated = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);
    const limit = args.limit ?? 10;

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const topRatings = ratings
      .sort((a: any, b: any) => b.rating - a.rating)
      .slice(0, limit);

    const websites = [];
    for (const rating of topRatings) {
      const website = await ctx.db.get(rating.websiteId);
      if (website) {
        websites.push({
          ...website,
          rating: rating.rating,
          usefulness: rating.usefulness,
        });
      }
    }

    return websites;
  },
});

export const getUsageTrends = query({
  args: {
    token: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);
    const days = args.days ?? 30;

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const startDate = now - (days * dayMs);

    const dailyCounts: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * dayMs));
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }

    for (const website of websites) {
      if (website.createdAt >= startDate) {
        const date = new Date(website.createdAt);
        const dateStr = date.toISOString().split('T')[0];
        if (dailyCounts[dateStr] !== undefined) {
          dailyCounts[dateStr]++;
        }
      }
    }

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getFolderStats = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const websites = await ctx.db
      .query("websites")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const folderCounts: Record<string, number> = {};
    for (const website of websites) {
      if (website.folderId) {
        const folderId = website.folderId.toString();
        folderCounts[folderId] = (folderCounts[folderId] || 0) + 1;
      }
    }

    const stats = folders.map((folder: any) => ({
      id: folder._id,
      name: folder.name,
      isPublic: folder.isPublic,
      websiteCount: folderCounts[folder._id.toString()] || 0,
    }));

    return stats.sort((a: any, b: any) => b.websiteCount - a.websiteCount);
  },
});
