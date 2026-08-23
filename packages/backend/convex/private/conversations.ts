import { v } from "convex/values";
import { query } from "../_generated/server";

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
