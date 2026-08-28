/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as calls from "../calls.js";
import type * as contact_sessions from "../contact_sessions.js";
import type * as conversations from "../conversations.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as organizations from "../organizations.js";
import type * as private_analytics from "../private/analytics.js";
import type * as private_billing from "../private/billing.js";
import type * as private_conversations from "../private/conversations.js";
import type * as subscriptions from "../subscriptions.js";
import type * as system_AI_agents_supportAgent from "../system/AI/agents/supportAgent.js";
import type * as system_AI_tools_searchKnowledgeBase from "../system/AI/tools/searchKnowledgeBase.js";
import type * as system_conversations from "../system/conversations.js";
import type * as telemetry from "../telemetry.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  calls: typeof calls;
  contact_sessions: typeof contact_sessions;
  conversations: typeof conversations;
  files: typeof files;
  http: typeof http;
  messages: typeof messages;
  organizations: typeof organizations;
  "private/analytics": typeof private_analytics;
  "private/billing": typeof private_billing;
  "private/conversations": typeof private_conversations;
  subscriptions: typeof subscriptions;
  "system/AI/agents/supportAgent": typeof system_AI_agents_supportAgent;
  "system/AI/tools/searchKnowledgeBase": typeof system_AI_tools_searchKnowledgeBase;
  "system/conversations": typeof system_conversations;
  telemetry: typeof telemetry;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
