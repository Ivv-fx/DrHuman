import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { internal } from "../../../_generated/api";
import { z } from "zod";

export const supportAgent = new Agent({
  name: "supportAgent",
  systemMessage:
    "You are a helpful customer support assistant for the organization. " +
    "Your goal is to answer questions politely. If you don't know the answer, tell the user you will escalate to a human.",
  model: openai("gpt-4o-mini"),
  tools: {
    resolveConversation: {
      description: "Mark the conversation as resolved if the user's problem is completely solved.",
      parameters: z.object({
        conversationID: z.string(),
      }),
      execute: async ({ conversationID }, { runMutation }) => {
        await runMutation(internal.system.conversations.resolveInternal, {
          conversationID: conversationID as any,
        });
        return "Conversation resolved successfully.";
      },
    },
    escalateConversation: {
      description: "Escalate the conversation to a human operator if you cannot help the user.",
      parameters: z.object({
        conversationID: z.string(),
      }),
      execute: async ({ conversationID }, { runMutation }) => {
        await runMutation(internal.system.conversations.escalateInternal, {
          conversationID: conversationID as any,
        });
        return "Conversation escalated to a human. Stop talking now.";
      },
    },
    searchKnowledgeBase: {
      description: "Search the organization's uploaded documents for answers to the user's question.",
      parameters: z.object({
        query: z.string().describe("The search query to find relevant info"),
        organizationID: z.string().describe("The organization ID of the current session"),
      }),
      execute: async ({ query, organizationID }, { runAction }) => {
        return await runAction(internal.system.AI.tools.searchKnowledgeBase.search, {
          query,
          organizationID,
        });
      }
    }
  }
});
