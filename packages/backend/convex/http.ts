import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ─── Dograh Post-Call Webhook ─────────────────────────────────────────────
// Configure this URL in your Dograh dashboard as the webhook endpoint:
//   https://<your-deployment>.convex.site/dograh-webhook
//
// Dograh sends a POST with payload: { type, metadata, transcript, recording_url, duration, call_id }
// metadata should include: { organizationID, contactSessionID }
http.route({
  path: "/dograh-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { type, metadata = {}, transcript, recording_url, duration, call_id } = payload;

    if (type === "call.ended") {
      await ctx.runMutation(internal.calls.saveTranscript, {
        organizationID:   metadata.organizationID   ?? "unknown",
        contactSessionID: metadata.contactSessionID ?? undefined,
        provider:         "dograh",
        externalCallId:   call_id,
        transcript:       transcript,
        recordingUrl:     recording_url,
        duration:         duration,
        metadata:         payload,
      });
    }

    if (type === "call.started") {
      await ctx.runMutation(internal.calls.logCallStarted, {
        organizationID:   metadata.organizationID   ?? "unknown",
        contactSessionID: metadata.contactSessionID ?? undefined,
        provider:         "dograh",
        externalCallId:   call_id,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

// ─── Dograh Mid-Call Tool: Knowledge Base Lookup ─────────────────────────
// Register this URL as a tool in your Dograh agent builder:
//   https://<your-deployment>.convex.site/dograh-tool/search-kb
//
// Dograh sends: { parameters: { query, organizationID }, metadata: { ... } }
http.route({
  path: "/dograh-tool/search-kb",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { parameters = {}, metadata = {} } = payload;
    const organizationID = parameters.organizationID ?? metadata.organizationID;

    if (!organizationID) {
      return new Response(
        JSON.stringify({ error: "organizationID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Re-use the existing knowledge base search action
    const results = await ctx.runAction(
      internal.system.AI.tools.searchKnowledgeBase.search as any,
      { query: parameters.query, organizationID }
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// ─── Vapi Post-Call Webhook (bonus: mirrors same pattern for Vapi) ─────────
// Configure this URL in your Vapi dashboard → Server URL:
//   https://<your-deployment>.convex.site/vapi-webhook
http.route({
  path: "/vapi-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { message } = payload;
    if (!message) return new Response(null, { status: 200 });

    const { type, call, artifact } = message;
    const metadata = call?.metadata ?? {};

    if (type === "end-of-call-report") {
      await ctx.runMutation(internal.calls.saveTranscript, {
        organizationID:   metadata.organizationID   ?? "unknown",
        contactSessionID: metadata.contactSessionID ?? undefined,
        provider:         "vapi",
        externalCallId:   call?.id,
        transcript:       artifact?.transcript,
        recordingUrl:     artifact?.recordingUrl,
        duration:         call?.endedAt && call?.startedAt
          ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
          : undefined,
        metadata:         payload,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
