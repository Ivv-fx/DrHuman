import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";

declare var process: { env: Record<string, string | undefined> };

// ── Validate Clerk Organization ─────────────────────────────────────────────
export const validate = action({
  args: { organizationID: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.CLERK_SECRET_KEY) return false;
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
    try {
      const org = await clerk.organizations.getOrganization({ organizationId: args.organizationID });
      return !!org;
    } catch (e) {
      return false;
    }
  },
});

// ── Get org voice + business settings (called by widget) ────────────────────
export const getSettings = query({
  args: { organizationID: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db
      .query("org_settings")
      .withIndex("by_organizationID", (q) => q.eq("organizationID", args.organizationID))
      .unique();

    if (!s) {
      return {
        voiceProvider:   "disabled" as const,
        businessName:    null,
        businessContext: null,
        systemPrompt:    null,
        vapiAssistantId: null,
        dograhAgentId:   null,
        dograhBaseUrl:   null,
        geminiModel:     null,
      };
    }

    return {
      voiceProvider:   s.voiceProvider,
      businessName:    s.businessName    ?? null,
      businessContext: s.businessContext ?? null,
      systemPrompt:    s.systemPrompt    ?? null,
      vapiAssistantId: s.vapiAssistantId ?? null,
      dograhAgentId:   s.dograhAgentId   ?? null,
      dograhBaseUrl:   s.dograhBaseUrl   ?? null,
      geminiModel:     s.geminiModel     ?? null,
      // geminiApiKey intentionally excluded — never sent to browser
    };
  },
});

// ── Upsert org voice + business settings (called by admin in widget) ─────────
export const upsertSettings = mutation({
  args: {
    organizationID:  v.string(),
    voiceProvider:   v.union(
      v.literal("disabled"),
      v.literal("vapi"),
      v.literal("dograh"),
      v.literal("gemini")
    ),
    // Business identity
    businessName:    v.optional(v.string()),
    businessContext: v.optional(v.string()),
    systemPrompt:    v.optional(v.string()),
    // Vapi
    vapiAssistantId: v.optional(v.string()),
    // Dograh
    dograhAgentId:   v.optional(v.string()),
    dograhBaseUrl:   v.optional(v.string()),
    dograhApiKey:    v.optional(v.string()),
    // Gemini
    geminiModel:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("org_settings")
      .withIndex("by_organizationID", (q) => q.eq("organizationID", args.organizationID))
      .unique();

    const data = {
      organizationID:  args.organizationID,
      voiceProvider:   args.voiceProvider,
      businessName:    args.businessName,
      businessContext: args.businessContext,
      systemPrompt:    args.systemPrompt,
      vapiAssistantId: args.vapiAssistantId,
      dograhAgentId:   args.dograhAgentId,
      dograhBaseUrl:   args.dograhBaseUrl,
      dograhApiKey:    args.dograhApiKey,
      geminiModel:     args.geminiModel,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return await ctx.db.insert("org_settings", data);
  },
});
