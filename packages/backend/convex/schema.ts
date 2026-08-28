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
    browserInfo: v.optional(v.any()),
    expiresAt: v.number(),
  }).index("by_organization", ["organizationID"]),

  conversations: defineTable({
    organizationID: v.string(),
    contactSessionID: v.id("contact_sessions"),
    threadID: v.optional(v.string()),
    status: v.union(v.literal("unresolved"), v.literal("pending"), v.literal("escalated"), v.literal("resolved")),
    unreadCount: v.optional(v.number()),
  })
    .index("by_organizationID", ["organizationID"])
    .index("by_contactSessionID", ["contactSessionID"])
    .index("by_threadID", ["threadID"])
    .index("by_status_and_organizationID", ["status", "organizationID"]),

  messages: defineTable({
    conversationID: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    isHuman: v.optional(v.boolean()),
  }).index("by_conversationID", ["conversationID"]),

  files: defineTable({
    organizationID: v.string(),
    storageId: v.id("_storage"),
    name: v.string(),
    status: v.union(v.literal("processing"), v.literal("ready"), v.literal("failed")),
    embedding: v.optional(v.array(v.number())),
    text: v.optional(v.string()),
  })
    .index("by_organizationID", ["organizationID"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["organizationID"],
    }),

  telemetry: defineTable({
    organizationID: v.string(),
    event: v.union(v.literal("widget_load"), v.literal("chat_started"), v.literal("voice_started")),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_organizationID", ["organizationID"]),

  subscriptions: defineTable({
    organizationID: v.string(),
    razorpayCustomerId: v.string(),
    razorpaySubscriptionId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
    status: v.string(),
    currentPeriodEnd: v.number(),
  })
    .index("by_organizationID", ["organizationID"])
    .index("by_razorpaySubscriptionId", ["razorpaySubscriptionId"]),

  // ── Voice Provider Settings (per org) ───────────────────────────────────
  org_settings: defineTable({
    organizationID: v.string(),

    // Which voice provider is active for this org
    voiceProvider: v.union(
      v.literal("disabled"),
      v.literal("vapi"),
      v.literal("dograh"),
      v.literal("gemini")   // Gemini Live Direct (no VPS needed)
    ),

    // ── Business identity (used in system prompt) ────────────────────────
    businessName:    v.optional(v.string()), // e.g. "TechCorp Solutions"
    businessContext: v.optional(v.string()), // What the business does (1-3 sentences)
    systemPrompt:    v.optional(v.string()), // Full custom system prompt (overrides auto-generated)

    // ── Vapi config ──────────────────────────────────────────────────────
    vapiAssistantId: v.optional(v.string()),

    // ── Dograh config ────────────────────────────────────────────────────
    dograhAgentId:  v.optional(v.string()),
    dograhBaseUrl:  v.optional(v.string()),
    dograhApiKey:   v.optional(v.string()),

    // ── Gemini Live config ───────────────────────────────────────────────
    // Note: geminiApiKey is stored here but NEVER sent to browser clients.
    // The widget proxies through a Next.js API route for security.
    geminiModel:    v.optional(v.string()), // e.g. "gemini-2.0-flash-live-001"
  }).index("by_organizationID", ["organizationID"]),

  // ── Call Logs (Vapi + Dograh + Gemini transcripts) ───────────────────────
  call_logs: defineTable({
    organizationID:   v.string(),
    contactSessionID: v.optional(v.id("contact_sessions")),
    provider:         v.union(v.literal("vapi"), v.literal("dograh"), v.literal("gemini")),
    externalCallId:   v.optional(v.string()),
    duration:         v.optional(v.number()),
    transcript:       v.optional(v.string()),
    recordingUrl:     v.optional(v.string()),
    status:           v.union(
      v.literal("started"),
      v.literal("ended"),
      v.literal("failed")
    ),
    metadata:         v.optional(v.any()),
  })
    .index("by_organizationID", ["organizationID"])
    .index("by_contactSessionID", ["contactSessionID"]),
});
