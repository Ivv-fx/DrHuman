import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { supportAgent } from "./system/AI/agents/supportAgent";

export const create = mutation({
  args: {
    conversationID: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationID);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationID: args.conversationID,
      role: "user",
      content: args.content,
    });

    return messageId;
  },
});

export const getMany = query({
  args: {
    conversationID: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationID", (q) => q.eq("conversationID", args.conversationID))
      .collect();
  },
});

export const generateAIResponse = action({
  args: {
    conversationID: v.id("conversations"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const threadId = await ctx.runQuery(api.messages.getThreadId, {
      conversationID: args.conversationID,
    });
    
    // We also need the org ID
    const conv = await ctx.db.get(args.conversationID);
    
    if (threadId && conv) {
      try {
        await supportAgent.addMessage({ 
          threadId, 
          role: "user", 
          content: `[System Context: The ID of this conversation is ${args.conversationID}. The organizationID is ${conv.organizationID}. Use these if you need to call tools.]\n\nUser Message: ${args.message}` 
        });
        await supportAgent.run({ threadId });
      } catch (e) {
        console.error("Agent run failed:", e);
      }
    }
  },
});

export const getThreadId = query({
  args: { conversationID: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationID);
    return conv?.threadID;
  }
});
