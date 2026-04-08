FROM node:20-slim AS base
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/cell-runtime-core/package.json libs/cell-runtime-core/package.json
COPY libs/contract/package.json libs/contract/package.json
COPY libs/engine/package.json libs/engine/package.json
COPY libs/loader/package.json libs/loader/package.json
COPY apps/cell-runtime-api/package.json apps/cell-runtime-api/package.json
RUN pnpm install --frozen-lockfile --filter @ikary/cell-runtime-api...

# ── Build ──
FROM deps AS build
COPY libs/cell-runtime-core/ libs/cell-runtime-core/
COPY libs/contract/ libs/contract/
COPY libs/engine/ libs/engine/
COPY libs/loader/ libs/loader/
COPY apps/cell-runtime-api/ apps/cell-runtime-api/
RUN pnpm --filter @ikary/contract build \
 && pnpm --filter @ikary/engine build \
 && pnpm --filter @ikary/loader build \
 && pnpm --filter @ikary/cell-runtime-core build \
 && pnpm --filter @ikary/cell-runtime-api build

# ── Production image ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cell-runtime-api/node_modules ./apps/cell-runtime-api/node_modules
COPY --from=build /app/apps/cell-runtime-api/dist ./apps/cell-runtime-api/dist

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 4000
ENV PORT=4000
CMD ["node", "apps/cell-runtime-api/dist/main.js"]
