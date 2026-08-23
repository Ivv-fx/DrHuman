import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { supportAgent } from "./system/AI/agents/supportAgent";

export const create = mutation({
  args: {
    organizationID: v.string(),
    contactSessionID: v.id("contact_sessions"),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db.get(args.contactSessionID);
    if (!session || session.organizationID !== args.organizationID || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    // Create a new thread using the AI agent
    // Since supportAgent isn't fully set up yet, we will mock the thread ID if it's missing.
    let threadID = undefined;
    try {
      threadID = await supportAgent.createThread();
    } catch (e) {
      console.warn("Failed to create AI thread, continuing without it.", e);
    }

    return await ctx.db.insert("conversations", {
      organizationID: args.organizationID,
      contactSessionID: args.contactSessionID,
      threadID,
      status: "unresolved",
    });
  },
});

export const getOne = query({
  args: {
    conversationID: v.id("conversations"),
    contactSessionID: v.id("contact_sessions"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationID);
    
    // Security check: ensure the conversation belongs to the contact session
    if (!conversation || conversation.contactSessionID !== args.contactSessionID) {
      return null;
    }

    return conversation;
  }
});

export const getMany = query({
  args: {
    contactSessionID: v.id("contact_sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_contactSessionID", (q) => q.eq("contactSessionID", args.contactSessionID))
      .order("desc")
      .collect();
  }
});
