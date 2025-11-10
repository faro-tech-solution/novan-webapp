# syntax=docker/dockerfile:1

FROM node:18-bookworm-slim AS base
WORKDIR /app

ENV NODE_ENV=production

# --- Install deps ---
FROM base AS deps
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# --- Build the app ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# پاک کردن خروجی‌های قبلی برای اطمینان
RUN rm -rf .next && corepack enable && yarn build

# --- Production image ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN useradd --system --create-home --gid root nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
