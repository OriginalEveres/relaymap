# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/api-contracts/package.json packages/api-contracts/
COPY packages/bitcoin-network/package.json packages/bitcoin-network/
COPY packages/db/package.json packages/db/
COPY packages/domain-shared/package.json packages/domain-shared/
COPY packages/tsconfig/package.json packages/tsconfig/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @relaymap/db prisma:generate \
 && pnpm --filter @relaymap/api... build

FROM deps AS pruned
COPY --from=build /repo .
RUN pnpm --filter @relaymap/api deploy --prod /app

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=pruned /app /app
EXPOSE 3000
CMD ["node", "--enable-source-maps", "dist/main.js"]
