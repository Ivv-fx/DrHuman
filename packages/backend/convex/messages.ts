import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { supportAgent } from "./system/AI/agents/supportAgent";

export const create = mutation({
  args: {
    conversationID: v.id("conversations"),
    content: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("assistant"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationID);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationID: args.conversationID,
      role: args.role ?? "user",
      content: args.content,
    });

    // Increment unread count when a visitor sends a message (not operator/AI)
    const effectiveRole = args.role ?? "user";
    if (effectiveRole === "user") {
      const currentUnread = conversation.unreadCount ?? 0;
      await ctx.db.patch(args.conversationID, {
        unreadCount: currentUnread + 1,
      });
    }

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
    const conv = await ctx.runQuery(api.messages.getConversationDetails, {
      conversationID: args.conversationID,
    });
    
    if (conv && conv.threadID) {
      try {
        const { thread } = await supportAgent.continueThread(ctx, { threadId: conv.threadID });
        await thread.generateText({
          prompt: `[System Context: The ID of this conversation is ${args.conversationID}. The organizationID is ${conv.organizationID}. Use these if you need to call tools.]\n\nUser Message: ${args.message}`
        });
      } catch (e) {
        console.error("Agent run failed:", e);
      }
    }
  },
});

export const getConversationDetails = query({
  args: { conversationID: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationID);
  }
});
