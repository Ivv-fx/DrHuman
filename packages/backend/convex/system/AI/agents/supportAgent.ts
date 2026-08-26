import { Agent, createTool } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { internal, components } from "../../../_generated/api";
import { z } from "zod";

export const supportAgent: Agent<any, any> = new Agent(components.agent, {
  name: "supportAgent",
  instructions:
    "You are a helpful customer support assistant for the organization. " +
    "Your goal is to answer questions politely. If you don't know the answer, tell the user you will escalate to a human.",
  languageModel: openai("gpt-4o-mini"),
  tools: {
    resolveConversation: createTool({
      description: "Mark the conversation as resolved if the user's problem is completely solved.",
      inputSchema: z.object({
        conversationID: z.string(),
      }),
      execute: async (ctx, { conversationID }) => {
        await ctx.runMutation(internal.system.conversations.resolveInternal, {
          conversationID: conversationID as any,
        });
        return "Conversation resolved successfully.";
      },
    }),
    escalateConversation: createTool({
      description: "Escalate the conversation to a human operator if you cannot help the user.",
      inputSchema: z.object({
        conversationID: z.string(),
      }),
      execute: async (ctx, { conversationID }) => {
        await ctx.runMutation(internal.system.conversations.escalateInternal, {
          conversationID: conversationID as any,
        });
        return "Conversation escalated to a human. Stop talking now.";
      },
    }),
    searchKnowledgeBase: createTool({
      description: "Search the organization's uploaded documents for answers to the user's question.",
      inputSchema: z.object({
        query: z.string().describe("The search query to find relevant info"),
        organizationID: z.string().describe("The organization ID of the current session"),
      }),
      execute: async (ctx, { query, organizationID }) => {
        return await ctx.runAction(internal.system.AI.tools.searchKnowledgeBase.search, {
          query,
          organizationID,
        });
      }
    })
  }
});
