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

// Create a new folder
export const create = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    // If parentId provided, verify it belongs to user
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent || parent.userId !== userId) {
        throw new Error("Parent folder not found");
      }
    }

    // Get the highest order number for siblings
    const siblings = await ctx.db
      .query("folders")
      .withIndex("by_user_and_parent", (q: any) => 
        q.eq("userId", userId).eq("parentId", args.parentId)
      )
      .collect();

    const maxOrder = siblings.reduce((max: number, f: any) => Math.max(max, f.order), -1);

    const now = Date.now();
    const folderId = await ctx.db.insert("folders", {
      userId,
      name: args.name,
      parentId: args.parentId,
      isPublic: args.isPublic ?? false,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return folderId;
  },
});

// Get all folders for a user
export const list = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    return folders.sort((a: any, b: any) => a.order - b.order);
  },
});

// Get folders in a specific parent
export const getByParent = query({
  args: {
    token: v.string(),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user_and_parent", (q: any) => 
        q.eq("userId", userId).eq("parentId", args.parentId)
      )
      .collect();

    return folders.sort((a: any, b: any) => a.order - b.order);
  },
});

// Get a single folder
export const get = query({
  args: {
    token: v.string(),
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folder = await ctx.db.get(args.folderId);
    if (!folder) return null;

    // Check access
    if (folder.userId !== userId && !folder.isPublic) {
      throw new Error("Access denied");
    }

    return folder;
  },
});

// Update a folder
export const update = mutation({
  args: {
    token: v.string(),
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.folderId, updates);
    return { success: true };
  },
});

// Move a folder to a new parent
export const move = mutation({
  args: {
    token: v.string(),
    folderId: v.id("folders"),
    newParentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    // Verify new parent belongs to user
    if (args.newParentId) {
      const parent = await ctx.db.get(args.newParentId);
      if (!parent || parent.userId !== userId) {
        throw new Error("Parent folder not found");
      }
    }

    // Get max order in new parent
    const siblings = await ctx.db
      .query("folders")
      .withIndex("by_user_and_parent", (q: any) => 
        q.eq("userId", userId).eq("parentId", args.newParentId)
      )
      .collect();

    const maxOrder = siblings.reduce((max: number, f: any) => Math.max(max, f.order), -1);

    await ctx.db.patch(args.folderId, {
      parentId: args.newParentId,
      order: maxOrder + 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Reorder folders
export const reorder = mutation({
  args: {
    token: v.string(),
    folderIds: v.array(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    for (let i = 0; i < args.folderIds.length; i++) {
      const folder = await ctx.db.get(args.folderIds[i]);
      if (folder && folder.userId === userId) {
        await ctx.db.patch(args.folderIds[i], {
          order: i,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

// Delete a folder and all its contents
export const remove = mutation({
  args: {
    token: v.string(),
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    // Delete all websites in this folder
    const websites = await ctx.db
      .query("websites")
      .withIndex("by_folder", (q: any) => q.eq("folderId", args.folderId))
      .collect();

    for (const website of websites) {
      // Delete ratings for this website
      const ratings = await ctx.db
        .query("ratings")
        .withIndex("by_website", (q: any) => q.eq("websiteId", website._id))
        .collect();
      
      for (const rating of ratings) {
        await ctx.db.delete(rating._id);
      }
      
      await ctx.db.delete(website._id);
    }

    // Delete all subfolders recursively
    const subfolders = await ctx.db
      .query("folders")
      .withIndex("by_parent", (q: any) => q.eq("parentId", args.folderId))
      .collect();

    for (const subfolder of subfolders) {
      // Recursively delete subfolder contents
      const subWebsites = await ctx.db
        .query("websites")
        .withIndex("by_folder", (q: any) => q.eq("folderId", subfolder._id))
        .collect();
      
      for (const website of subWebsites) {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_website", (q: any) => q.eq("websiteId", website._id))
          .collect();
        
        for (const rating of ratings) {
          await ctx.db.delete(rating._id);
        }
        
        await ctx.db.delete(website._id);
      }
      
      await ctx.db.delete(subfolder._id);
    }

    // Delete the folder itself
    await ctx.db.delete(args.folderId);

    return { success: true };
  },
});

// Get folder tree structure
export const getTree = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifyAuth(ctx, args.token);

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    // Build tree structure
    const folderMap = new Map();
    for (const folder of folders) {
      folderMap.set(folder._id.toString(), { ...folder, children: [] });
    }

    const roots: any[] = [];
    for (const folder of folders) {
      const node = folderMap.get(folder._id.toString());
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    // Sort by order
    const sortByOrder = (items: any[]) => {
      items.sort((a, b) => a.order - b.order);
      for (const item of items) {
        if (item.children) {
          sortByOrder(item.children);
        }
      }
    };

    sortByOrder(roots);

    return roots;
  },
});

// Get public folder
export const getPublicFolder = query({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.folderId);
    if (!folder || !folder.isPublic) {
      return null;
    }
    return folder;
  },
});
