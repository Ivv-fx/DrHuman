import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateSubscription = mutation({
  args: {
    organizationID: v.string(),
    razorpayCustomerId: v.string(),
    razorpaySubscriptionId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_organizationID", (q) =>
        q.eq("organizationID", args.organizationID)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        razorpayCustomerId: args.razorpayCustomerId,
        razorpaySubscriptionId: args.razorpaySubscriptionId,
        plan: args.plan,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        organizationID: args.organizationID,
        razorpayCustomerId: args.razorpayCustomerId,
        razorpaySubscriptionId: args.razorpaySubscriptionId,
        plan: args.plan,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
      });
    }
  },
});

export const updateSubscriptionStatus = mutation({
  args: {
    razorpaySubscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_razorpaySubscriptionId", (q) =>
        q.eq("razorpaySubscriptionId", args.razorpaySubscriptionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
      });
    }
  },
});
