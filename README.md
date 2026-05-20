# Relaymap

A richer alternative to [bitnodes.io](https://bitnodes.io) for the Bitcoin P2P network. Open source, MIT-licensed, built on the [`bitcoin-node-scanner`](https://www.npmjs.com/package/bitcoin-node-scanner) crawler.

## Repository layout

```
apps/
  api/                  NestJS HTTP API + WebSocket
  crawler/              NestJS standalone — scheduled crawler
packages/
  domain-shared/        Cross-context primitives (Result, DomainEvent, AggregateRoot)
  bitcoin-network/      Bounded context: observed Bitcoin nodes
  crawling/             Bounded context: the act of scanning
  api-contracts/        HTTP DTOs + Zod schemas (the wire format)
  db/                   Prisma schema + generated client
  tsconfig/             Shared TypeScript configurations
```

Each bounded context is split into `domain/`, `application/`, and `infrastructure/`. Dependency direction is enforced via `eslint-plugin-boundaries`.

## Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10 (`npm install -g pnpm`)
- Docker (for local Postgres)

## Getting started

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:migrate
pnpm build
pnpm dev
```

## Development workflow

| Command | What it does |
|---|---|
| `pnpm dev` | Run api + crawler in watch mode |
| `pnpm build` | Build every workspace package |
| `pnpm lint` | Lint everything (boundaries enforced) |
| `pnpm typecheck` | Type-check without emit |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## License

MIT — see [LICENSE](./LICENSE).
