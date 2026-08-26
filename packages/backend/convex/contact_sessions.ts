import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const create = mutation({
  args: {
    organizationID: v.string(),
    name: v.string(),
    email: v.string(),
    browserInfo: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Generate an expiry time
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    const sessionId = await ctx.db.insert("contact_sessions", {
      organizationID: args.organizationID,
      name: args.name,
      email: args.email,
      browserInfo: args.browserInfo,
      expiresAt,
    });

    return sessionId;
  },
});

export const validate = query({
  args: {
    sessionId: v.id("contact_sessions"),
    organizationID: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return false;
    
    // Ensure the session is for the correct organization
    if (session.organizationID !== args.organizationID) return false;

    // Check expiration
    if (session.expiresAt < Date.now()) return false;

    return true;
  },
});

export const getOne = query({
  args: {
    sessionID: v.id("contact_sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionID);
  },
});
