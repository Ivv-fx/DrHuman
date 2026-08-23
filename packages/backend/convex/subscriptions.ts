import { v } from "convex/values";
import { query } from "./_generated/server";

export const getSubscription = query({
  args: {
    organizationID: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organizationID", (q) =>
        q.eq("organizationID", args.organizationID)
      )
      .first();

    return subscription;
  },
});
