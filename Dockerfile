FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/cell-migration-core/package.json libs/cell-migration-core/package.json
COPY libs/contract/package.json libs/contract/package.json
COPY libs/engine/package.json libs/engine/package.json
COPY libs/loader/package.json libs/loader/package.json
COPY libs/primitive-contract/package.json libs/primitive-contract/package.json
COPY libs/system-db-core/package.json libs/system-db-core/package.json
COPY libs/system-log-core/package.json libs/system-log-core/package.json
COPY apps/mcp-server/package.json apps/mcp-server/package.json
RUN pnpm install --frozen-lockfile --filter @ikary/mcp-server...

# ── Build ──
FROM deps AS build
COPY libs/cell-migration-core/ libs/cell-migration-core/
COPY libs/contract/ libs/contract/
COPY libs/engine/ libs/engine/
COPY libs/loader/ libs/loader/
COPY libs/primitive-contract/ libs/primitive-contract/
COPY libs/system-db-core/ libs/system-db-core/
COPY libs/system-log-core/ libs/system-log-core/
COPY apps/mcp-server/ apps/mcp-server/
COPY manifests/ manifests/
RUN pnpm --filter @ikary/contract build \
 && pnpm --filter @ikary/engine build \
 && pnpm --filter @ikary/loader build \
 && pnpm --filter @ikary/primitive-contract build \
 && pnpm --filter @ikary/system-db-core build \
 && pnpm --filter @ikary/system-log-core build \
 && pnpm --filter @ikary/cell-migration-core build \
 && pnpm --filter @ikary/mcp-server build

# ── Production image ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/mcp-server/node_modules ./apps/mcp-server/node_modules
COPY --from=build /app/apps/mcp-server/dist ./apps/mcp-server/dist
COPY --from=build /app/manifests ./manifests
# Migrations must live at libs/system-log-core/migrations/ relative to the app root
# (resolveSystemLogMigrationsRoot() resolves 3 dirs up from dist/)
COPY --from=build /app/libs/system-log-core/migrations ./libs/system-log-core/migrations

EXPOSE 4502
ENV PORT=4502
CMD ["node", "apps/mcp-server/dist/main.js"]
