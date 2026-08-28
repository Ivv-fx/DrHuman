# ==============================================================================
# BASE IMAGE - Alpine Node
# ==============================================================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ==============================================================================
# BUILDER - Prune Monorepo
# ==============================================================================
FROM base AS builder
# Install turbo globally for pruning
RUN pnpm add -g turbo
WORKDIR /app
COPY . .
# Prune the workspace to only include the widget app and its dependencies
RUN turbo prune widget --docker

# ==============================================================================
# INSTALLER - Install dependencies and build
# ==============================================================================
FROM base AS installer
WORKDIR /app

# First install dependencies (to cache them)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Now copy source code and build
COPY --from=builder /app/out/full/ .

# We need these build-time environment variables for Next.js standalone mode
# They will be overridden at runtime by Cloud Run
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_VAPI_PUBLIC_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL
ENV NEXT_PUBLIC_VAPI_PUBLIC_KEY=$NEXT_PUBLIC_VAPI_PUBLIC_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Build the widget app (using turbo)
RUN pnpm turbo run build --filter=widget...

# ==============================================================================
# RUNNER - Production Image
# ==============================================================================
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next.js standalone mode copies node_modules and output files intelligently
COPY --from=installer /app/apps/widget/public ./apps/widget/public

# Automatically leverage output traces to reduce image size
COPY --from=installer /app/apps/widget/.next/standalone ./
COPY --from=installer /app/apps/widget/.next/static ./apps/widget/.next/static

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the standalone server
CMD ["node", "apps/widget/server.js"]
