import { v } from "convex/values";
import { query } from "../_generated/server";

export const getDashboardMetrics = query({
  args: {
    organizationID: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Total widget views
    const telemetry = await ctx.db
      .query("telemetry")
      .withIndex("by_organizationID", (q) =>
        q.eq("organizationID", args.organizationID)
      )
      .collect();

    const widgetViews = telemetry.filter((t) => t.event === "widget_load").length;

    // 2. Total conversations & AI resolution rate
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organizationID", (q) =>
        q.eq("organizationID", args.organizationID)
      )
      .collect();

    const totalConversations = conversations.length;
    const resolvedConversations = conversations.filter(
      (c) => c.status === "resolved"
    ).length;
    const escalatedConversations = conversations.filter(
      (c) => c.status === "escalated"
    ).length;

    let aiResolutionRate = 0;
    if (totalConversations > 0) {
      aiResolutionRate = Math.round(
        (resolvedConversations / totalConversations) * 100
      );
    }

    // 3. Views by day for the last 7 days (for chart)
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const startOfDay = now - i * oneDay;
      const endOfDay = startOfDay + oneDay;

      const date = new Date(startOfDay);
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

      const viewsThatDay = telemetry.filter(
        (t) =>
          t.event === "widget_load" &&
          t.timestamp >= startOfDay &&
          t.timestamp < endOfDay
      ).length;

      chartData.push({
        date: dateLabel,
        views: viewsThatDay,
      });
    }

    return {
      widgetViews,
      totalConversations,
      aiResolutionRate,
      escalatedConversations,
      chartData,
    };
  },
});
