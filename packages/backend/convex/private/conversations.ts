import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getMany = query({
  args: {
    organizationID: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real app we would check ctx.auth.getUserIdentity() and ensure they belong to args.organizationID.
    // Assuming this is done via Clerk/Convex auth middleware.
    
    return await ctx.db
      .query("conversations")
      .withIndex("by_organizationID", (q) => q.eq("organizationID", args.organizationID))
      .order("desc")
      .collect();
  }
});

export const getOne = query({
  args: {
    conversationID: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationID);
  },
});

export const updateStatus = mutation({
  args: {
    conversationID: v.id("conversations"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("pending"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationID);
    if (!conversation) throw new Error("Conversation not found");
    await ctx.db.patch(args.conversationID, { status: args.status });
  },
});

export const markAsRead = mutation({
  args: {
    conversationID: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationID);
    if (!conversation) throw new Error("Conversation not found");
    await ctx.db.patch(args.conversationID, { unreadCount: 0 });
  },
});
