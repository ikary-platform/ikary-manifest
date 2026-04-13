FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/system-migration-core/package.json libs/system-migration-core/package.json
COPY libs/cell-runtime-core/package.json libs/cell-runtime-core/package.json
COPY libs/cell-contract/package.json libs/cell-contract/package.json
COPY libs/cell-engine/package.json libs/cell-engine/package.json
COPY libs/cell-loader/package.json libs/cell-loader/package.json
COPY libs/system-auth/package.json libs/system-auth/package.json
COPY libs/system-db-core/package.json libs/system-db-core/package.json
COPY libs/system-log-core/package.json libs/system-log-core/package.json
COPY apps/cell-runtime-api/package.json apps/cell-runtime-api/package.json
RUN pnpm install --frozen-lockfile --filter @ikary/cell-runtime-api...

# ── Build ──
FROM deps AS build
COPY libs/system-migration-core/ libs/system-migration-core/
COPY libs/cell-runtime-core/ libs/cell-runtime-core/
COPY libs/cell-contract/ libs/cell-contract/
COPY libs/cell-engine/ libs/cell-engine/
COPY libs/cell-loader/ libs/cell-loader/
COPY libs/system-auth/ libs/system-auth/
COPY libs/system-db-core/ libs/system-db-core/
COPY libs/system-log-core/ libs/system-log-core/
COPY apps/cell-runtime-api/ apps/cell-runtime-api/
RUN pnpm --filter @ikary/cell-contract build \
 && pnpm --filter @ikary/cell-engine build \
 && pnpm --filter @ikary/cell-loader build \
 && pnpm --filter @ikary/system-db-core build \
 && pnpm --filter @ikary/system-log-core build \
 && pnpm --filter @ikary/system-auth build \
 && pnpm --filter @ikary/system-migration-core build \
 && pnpm --filter @ikary/cell-runtime-core build \
 && pnpm --filter @ikary/cell-runtime-api build

# ── Production image ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cell-runtime-api/node_modules ./apps/cell-runtime-api/node_modules
COPY --from=build /app/apps/cell-runtime-api/dist ./apps/cell-runtime-api/dist
COPY --from=build /app/libs/cell-runtime-core/migrations ./libs/cell-runtime-core/migrations
COPY --from=build /app/libs/system-auth/migrations ./libs/system-auth/migrations
COPY --from=build /app/libs/system-log-core/migrations ./libs/system-log-core/migrations

EXPOSE 4501
ENV PORT=4501
CMD ["node", "apps/cell-runtime-api/dist/main.js"]
