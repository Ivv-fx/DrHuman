import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Internal: save a call transcript (called by http.ts webhook handler) ───
export const saveTranscript = internalMutation({
  args: {
    organizationID:   v.string(),
    contactSessionID: v.optional(v.id("contact_sessions")),
    provider:         v.union(v.literal("vapi"), v.literal("dograh")),
    externalCallId:   v.optional(v.string()),
    transcript:       v.optional(v.string()),
    recordingUrl:     v.optional(v.string()),
    duration:         v.optional(v.number()),
    metadata:         v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("call_logs", {
      organizationID:   args.organizationID,
      contactSessionID: args.contactSessionID,
      provider:         args.provider,
      externalCallId:   args.externalCallId,
      transcript:       args.transcript,
      recordingUrl:     args.recordingUrl,
      duration:         args.duration,
      status:           "ended",
      metadata:         args.metadata,
    });
  },
});

// ─── Internal: log a call start event ───────────────────────────────────────
export const logCallStarted = internalMutation({
  args: {
    organizationID:   v.string(),
    contactSessionID: v.optional(v.id("contact_sessions")),
    provider:         v.union(v.literal("vapi"), v.literal("dograh")),
    externalCallId:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("call_logs", {
      organizationID:   args.organizationID,
      contactSessionID: args.contactSessionID,
      provider:         args.provider,
      externalCallId:   args.externalCallId,
      status:           "started",
    });
  },
});

// ─── Public: list recent call logs for an org (dashboard use) ───────────────
export const listRecent = query({
  args: {
    organizationID: v.string(),
    limit:          v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("call_logs")
      .withIndex("by_organizationID", (q) =>
        q.eq("organizationID", args.organizationID)
      )
      .order("desc")
      .take(args.limit ?? 20);
  },
});

// ─── Public: log a call from the widget client (started / failed) ────────────
export const logFromClient = mutation({
  args: {
    organizationID:   v.string(),
    contactSessionID: v.optional(v.id("contact_sessions")),
    provider:         v.union(v.literal("vapi"), v.literal("dograh")),
    externalCallId:   v.optional(v.string()),
    status:           v.union(v.literal("started"), v.literal("ended"), v.literal("failed")),
    duration:         v.optional(v.number()),
    transcript:       v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("call_logs", {
      organizationID:   args.organizationID,
      contactSessionID: args.contactSessionID,
      provider:         args.provider,
      externalCallId:   args.externalCallId,
      status:           args.status,
      duration:         args.duration,
      transcript:       args.transcript,
    });
  },
});
