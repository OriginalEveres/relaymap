# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/crawler/package.json apps/crawler/
COPY packages/bitcoin-network/package.json packages/bitcoin-network/
COPY packages/crawling/package.json packages/crawling/
COPY packages/db/package.json packages/db/
COPY packages/domain-shared/package.json packages/domain-shared/
COPY packages/tsconfig/package.json packages/tsconfig/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @relaymap/db prisma:generate \
 && pnpm --filter @relaymap/crawler... build

FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/crawler
# MaxMind GeoLite2 databases should be mounted at /data/geoip
VOLUME ["/data/geoip"]
CMD ["node", "--enable-source-maps", "dist/main.js"]
