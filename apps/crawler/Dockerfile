# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/crawler/package.json apps/crawler/
COPY apps/web/package.json apps/web/
COPY packages/api-contracts/package.json packages/api-contracts/
COPY packages/bitcoin-network/package.json packages/bitcoin-network/
COPY packages/crawling/package.json packages/crawling/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
COPY packages/common/type-utils/package.json packages/common/type-utils/
COPY packages/tsconfig/package.json packages/tsconfig/
RUN pnpm install --frozen-lockfile --prod --shamefully-hoist
RUN cp -r node_modules /prod_modules

FROM deps AS build
RUN rm -rf node_modules && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @relaymap/db prisma:generate \
 && pnpm --filter @relaymap/crawler... build

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=deps /repo/pnpm-workspace.yaml /repo/package.json /repo/.npmrc ./
COPY --from=deps /prod_modules ./node_modules
COPY --from=build /repo/apps/crawler/dist ./apps/crawler/dist
COPY --from=build /repo/apps/crawler/package.json ./apps/crawler/
COPY --from=build /repo/packages/bitcoin-network/dist ./packages/bitcoin-network/dist
COPY --from=build /repo/packages/bitcoin-network/package.json ./packages/bitcoin-network/
COPY --from=build /repo/packages/crawling/dist ./packages/crawling/dist
COPY --from=build /repo/packages/crawling/package.json ./packages/crawling/
COPY --from=build /repo/packages/db/dist ./packages/db/dist
COPY --from=build /repo/packages/db/package.json ./packages/db/
COPY --from=build /repo/packages/db/prisma ./packages/db/prisma
CMD ["node", "--enable-source-maps", "apps/crawler/dist/main.js"]
