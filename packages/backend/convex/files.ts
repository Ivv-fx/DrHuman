import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { OpenAI } from "openai";

// 1. Generate an upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// 2. Save the file metadata after upload
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    organizationID: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Billing Gate Check
    const existingFiles = await ctx.db
      .query("files")
      .withIndex("by_organizationID", (q) => q.eq("organizationID", args.organizationID))
      .collect();

    if (existingFiles.length > 0) {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_organizationID", (q) => q.eq("organizationID", args.organizationID))
        .first();

      const isPro = subscription?.plan === "pro" && subscription?.status === "active";
      
      if (!isPro) {
        throw new Error("Free plan is limited to 1 document. Please upgrade to Pro.");
      }
    }

    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      organizationID: args.organizationID,
      name: args.name,
      status: "processing",
    });

    // Kick off background job to process text and embeddings
    await ctx.scheduler.runAfter(0, internal.files.processFile, {
      fileId,
      storageId: args.storageId,
    });

    return fileId;
  },
});

// 3. Process the file (Extract Text -> Embed -> Save)
export const processFile = internalAction({
  args: {
    fileId: v.id("files"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      if (!url) throw new Error("File not found");

      // Fetch the file content
      const response = await fetch(url);
      const text = await response.text(); // Assuming simple text files for now

      // Generate embedding using OpenAI
      const openai = new OpenAI();
      const embeddingResponse = await openai.embeddings.create({
        input: text.slice(0, 8000), // OpenAI limits input size
        model: "text-embedding-3-small",
      });
      const embedding = embeddingResponse.data[0].embedding;

      // Update the file in DB
      await ctx.runMutation(internal.files.updateFileStatus, {
        fileId: args.fileId,
        status: "ready",
        text,
        embedding,
      });
    } catch (e) {
      console.error(e);
      await ctx.runMutation(internal.files.updateFileStatus, {
        fileId: args.fileId,
        status: "failed",
      });
    }
  },
});

export const updateFileStatus = internalMutation({
  args: {
    fileId: v.id("files"),
    status: v.union(v.literal("ready"), v.literal("failed")),
    text: v.optional(v.string()),
    embedding: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      status: args.status,
      text: args.text,
      embedding: args.embedding,
    });
  },
});

export const getMany = query({
  args: {
    organizationID: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_organizationID", (q) => q.eq("organizationID", args.organizationID))
      .collect();
  }
});
