import { action } from "./_generated/server";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";

declare var process: { env: Record<string, string | undefined> };

// We need a clerk secret key in our Convex env variables to query the clerk backend API
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY, 
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 
});

export const validate = action({
  args: {
    organizationID: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY is not set in Convex");
      return false;
    }

    try {
      const org = await clerk.organizations.getOrganization({
        organizationId: args.organizationID,
      });

      if (org) return true;
      return false;
    } catch (e) {
      console.error("Failed to validate organization:", e);
      return false;
    }
  },
});
