# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:20.19.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm install; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found. Falling back to npm install" && npm install; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
ARG PAYLOAD_SECRET
ARG ENABLE_FIRST_ADMIN_BOOTSTRAP
ARG FIRST_ADMIN_BOOTSTRAP_TOKEN
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV ENABLE_FIRST_ADMIN_BOOTSTRAP=$ENABLE_FIRST_ADMIN_BOOTSTRAP
ENV FIRST_ADMIN_BOOTSTRAP_TOKEN=$FIRST_ADMIN_BOOTSTRAP_TOKEN
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found. Using npm build" && npm run build; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ARG PAYLOAD_SECRET
ARG ENABLE_FIRST_ADMIN_BOOTSTRAP
ARG FIRST_ADMIN_BOOTSTRAP_TOKEN
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV ENABLE_FIRST_ADMIN_BOOTSTRAP=$ENABLE_FIRST_ADMIN_BOOTSTRAP
ENV FIRST_ADMIN_BOOTSTRAP_TOKEN=$FIRST_ADMIN_BOOTSTRAP_TOKEN

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/public* ./public/ 

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js
