import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Enhanced hash function for passwords using multiple rounds
// Note: For production with sensitive data, consider using Convex Actions with bcrypt
function secureHash(password: string, salt: string = ""): string {
  const combined = password + salt + "webnest_secret_2024";
  let hash1 = 0, hash2 = 0, hash3 = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1 + char) | 0;
    hash2 = ((hash2 << 7) + hash2 + char) | 0;
    hash3 = ((hash3 << 3) - hash3 + char * (i + 1)) | 0;
  }
  
  // Multiple rounds for additional security
  for (let round = 0; round < 1000; round++) {
    hash1 = ((hash1 << 5) - hash1 + hash2) | 0;
    hash2 = ((hash2 << 7) + hash2 + hash3) | 0;
    hash3 = ((hash3 << 3) - hash3 + hash1) | 0;
  }
  
  return Math.abs(hash1).toString(36) + Math.abs(hash2).toString(36) + Math.abs(hash3).toString(36);
}

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  // Using timestamp and random for better entropy
  const timestamp = Date.now().toString(36);
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return timestamp + token;
}

// Input validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" };
  }
  return { valid: true };
}

function validateName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

function sanitizeText(text: string): string {
  return text.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// Register a new user
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    const email = sanitizeText(args.email.toLowerCase());
    const name = sanitizeText(args.name);
    const password = args.password;

    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!validateName(name)) {
      throw new Error("Name must be between 1 and 100 characters");
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();
    
    // Create user with hashed password
    const userId = await ctx.db.insert("users", {
      email,
      passwordHash: secureHash(password, email),
      name,
      createdAt: now,
      updatedAt: now,
    });

    // Create default preferences
    await ctx.db.insert("preferences", {
      userId,
      defaultView: "grid",
      defaultSort: "dateAdded",
      createdAt: now,
      updatedAt: now,
    });

    // Create default folder
    await ctx.db.insert("folders", {
      userId,
      name: "My Bookmarks",
      isPublic: false,
      order: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create session with secure token
    const token = generateSecureToken();
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: now,
    });

    return { userId, token };
  },
});

// Login
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = sanitizeText(args.email.toLowerCase());
    const password = args.password;

    if (!validateEmail(email)) {
      throw new Error("Invalid email or password");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      // Use same error message to prevent email enumeration
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash !== secureHash(password, email)) {
      throw new Error("Invalid email or password");
    }

    const now = Date.now();
    const token = generateSecureToken();
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: now,
    });

    return { userId: user._id, token };
  },
});

// Logout
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Get current user from token
export const getCurrentUser = query({
  args: {
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const token = args.token;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    // Get preferences
    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      ...user,
      passwordHash: undefined,
      preferences,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Not authenticated");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(session.userId, updates);
    return { success: true };
  },
});

// Update user preferences
export const updatePreferences = mutation({
  args: {
    token: v.string(),
    defaultView: v.optional(v.union(v.literal("grid"), v.literal("list"))),
    defaultSort: v.optional(v.union(
      v.literal("dateAdded"),
      v.literal("clickCount"),
      v.literal("rating"),
      v.literal("title")
    )),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Not authenticated");
    }

    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .first();

    if (!preferences) {
      throw new Error("Preferences not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.defaultView !== undefined) updates.defaultView = args.defaultView;
    if (args.defaultSort !== undefined) updates.defaultSort = args.defaultSort;
    if (args.theme !== undefined) updates.theme = args.theme;

    await ctx.db.patch(preferences._id, updates);
    return { success: true };
  },
});

// Change password
export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate new password
    const passwordValidation = validatePassword(args.newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    if (user.passwordHash !== secureHash(args.currentPassword, user.email)) {
      throw new Error("Current password is incorrect");
    }

    await ctx.db.patch(session.userId, {
      passwordHash: secureHash(args.newPassword, user.email),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
