import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    orgId: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]).index("by_orgId", ["orgId"]),
});
