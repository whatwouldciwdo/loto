# syntax=docker/dockerfile:1

##########
# Base
##########
FROM node:20-alpine AS base
# Prisma & some native deps need libc compatibility on Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

##########
# Dependencies
##########
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

##########
# Builder
##########
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build the standalone Next.js bundle
RUN npx prisma generate
# NEXT_TELEMETRY_DISABLED keeps builds quiet/offline
ENV NEXT_TELEMETRY_DISABLED=1
# BUILD_STANDALONE=1 makes next.config.mjs emit the standalone output on Linux
ENV BUILD_STANDALONE=1
RUN npm run build


##########
# Runner (production)
##########
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone server output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable directory for runtime file uploads (mounted as a volume in compose)
RUN mkdir -p ./public/uploads/evidence \
    && chown -R nextjs:nodejs ./public/uploads


# Prisma schema, migrations, engine and CLI needed for `prisma migrate deploy` at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Entrypoint runs `prisma migrate deploy` then starts the server
COPY --from=builder /app/docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

USER nextjs

EXPOSE 3000

# The standalone build emits server.js at the app root
ENTRYPOINT ["/bin/sh", "./docker/entrypoint.sh"]


