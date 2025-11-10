# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.20.4
FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV NODE_ENV=production
WORKDIR /app

# Ensure Yarn via Corepack is available in every stage
RUN corepack enable

# Install dependencies with build tooling
FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the Next.js application
FROM deps AS builder
ENV NODE_ENV=production

COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY=dummy-recaptcha-key
ARG RECAPTCHA_SECRET_KEY=dummy-recaptcha-secret-key

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY

RUN yarn build

# Runtime image for deployment platforms like Darkube
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

RUN useradd --system --create-home --gid root nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
