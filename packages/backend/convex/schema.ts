import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    orgId: v.optional(v.string()),
    role: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),
  
  contact_sessions: defineTable({
    organizationID: v.string(),
    name: v.string(),
    email: v.string(),
    browserInfo: v.optional(v.any()), // e.g. user agent, timezone
    expiresAt: v.number(), // Timestamp for session expiry
  }).index("by_organization", ["organizationID"]),

  conversations: defineTable({
    organizationID: v.string(),
    contactSessionID: v.id("contact_sessions"),
    threadID: v.optional(v.string()), // OpenAI Thread ID
    status: v.union(v.literal("unresolved"), v.literal("escalated"), v.literal("resolved")),
  })
    .index("by_organizationID", ["organizationID"])
    .index("by_contactSessionID", ["contactSessionID"])
    .index("by_threadID", ["threadID"])
    .index("by_status_and_organizationID", ["status", "organizationID"]),

  messages: defineTable({
    conversationID: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    isHuman: v.optional(v.boolean()), // true if operator sent it
  }).index("by_conversationID", ["conversationID"]),

  files: defineTable({
    organizationID: v.string(),
    storageId: v.id("_storage"),
    name: v.string(),
    status: v.union(v.literal("processing"), v.literal("ready"), v.literal("failed")),
    embedding: v.optional(v.array(v.number())),
    text: v.optional(v.string()), // extracted text
  })
    .index("by_organizationID", ["organizationID"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["organizationID"],
    }),

  telemetry: defineTable({
    organizationID: v.string(),
    event: v.union(v.literal("widget_load"), v.literal("chat_started")),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_organizationID", ["organizationID"]),

  subscriptions: defineTable({
    organizationID: v.string(),
    razorpayCustomerId: v.string(),
    razorpaySubscriptionId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
    status: v.string(), // active, past_due, canceled
    currentPeriodEnd: v.number(),
  })
    .index("by_organizationID", ["organizationID"])
    .index("by_razorpaySubscriptionId", ["razorpaySubscriptionId"]),
});
