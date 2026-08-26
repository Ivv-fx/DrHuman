import { v } from "convex/values";
import { internalAction } from "../../../_generated/server";
import { OpenAI } from "openai";
import { internal } from "../../../_generated/api";

export const search = internalAction({
  args: {
    organizationID: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Generate an embedding for the user's question
    const openai = new OpenAI();
    const embeddingResponse = await openai.embeddings.create({
      input: args.query,
      model: "text-embedding-3-small",
    });
    const embedding = embeddingResponse.data[0]?.embedding;
    if (!embedding) return "No embedding generated for query.";

    // 2. Search the vector index for similar documents
    const results = await ctx.vectorSearch("files", "by_embedding", {
      vector: embedding,
      limit: 3,
      filter: (q) => q.eq("organizationID", args.organizationID),
    });

    if (results.length === 0) {
      return "No relevant documents found in the knowledge base.";
    }

    let context = "";
    for (const result of results) {
      const file = await ctx.runQuery(internal.system.AI.tools.searchKnowledgeBase.getFile, { id: result._id });
      if (file && file.text) {
        context += `\n\n--- Document: ${file.name} ---\n${file.text}`;
      }
    }

    return context;
  },
});

import { internalQuery } from "../../../_generated/server";
export const getFile = internalQuery({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});
