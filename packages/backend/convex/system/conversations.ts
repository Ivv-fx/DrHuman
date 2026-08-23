import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";

export const resolveInternal = internalMutation({
  args: {
    conversationID: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationID, { status: "resolved" });
  }
});

export const escalateInternal = internalMutation({
  args: {
    conversationID: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationID, { status: "escalated" });
  }
});
