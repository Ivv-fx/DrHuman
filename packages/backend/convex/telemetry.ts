import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const recordEvent = mutation({
  args: {
    organizationID: v.string(),
    event: v.union(v.literal("widget_load"), v.literal("chat_started")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("telemetry", {
      organizationID: args.organizationID,
      event: args.event,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});
