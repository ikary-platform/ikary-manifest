ARG NODE_VERSION=24.14.1
FROM node:${NODE_VERSION}-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/cell-contract/package.json libs/cell-contract/package.json
COPY libs/cell-data/package.json libs/cell-data/package.json
COPY libs/cell-engine/package.json libs/cell-engine/package.json
COPY libs/cell-loader/package.json libs/cell-loader/package.json
COPY libs/cell-presentation/package.json libs/cell-presentation/package.json
COPY libs/cell-primitive-contract/package.json libs/cell-primitive-contract/package.json
COPY libs/cell-primitive-studio/package.json libs/cell-primitive-studio/package.json
COPY libs/cell-primitives/package.json libs/cell-primitives/package.json
COPY libs/cell-renderer/package.json libs/cell-renderer/package.json
COPY apps/cell-preview-server/package.json apps/cell-preview-server/package.json
RUN pnpm install --frozen-lockfile --filter @ikary/cell-preview-server...

# ── Build ──
FROM deps AS build
COPY libs/cell-contract/ libs/cell-contract/
COPY libs/cell-data/ libs/cell-data/
COPY libs/cell-engine/ libs/cell-engine/
COPY libs/cell-loader/ libs/cell-loader/
COPY libs/cell-presentation/ libs/cell-presentation/
COPY libs/cell-primitive-contract/ libs/cell-primitive-contract/
COPY libs/cell-primitive-studio/ libs/cell-primitive-studio/
COPY libs/cell-primitives/ libs/cell-primitives/
COPY libs/cell-renderer/ libs/cell-renderer/
COPY apps/cell-preview-server/ apps/cell-preview-server/
RUN pnpm --filter @ikary/cell-contract build \
 && pnpm --filter @ikary/cell-data build \
 && pnpm --filter @ikary/cell-engine build \
 && pnpm --filter @ikary/cell-loader build \
 && pnpm --filter @ikary/cell-presentation build \
 && pnpm --filter @ikary/cell-primitive-contract build \
 && pnpm --filter @ikary/cell-primitive-studio build \
 && pnpm --filter @ikary/cell-primitives build \
 && pnpm --filter @ikary/cell-renderer build \
 && pnpm --filter @ikary/cell-preview-server build \
 && pnpm --filter @ikary/cell-preview-server build:server

# ── Production image ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cell-preview-server/node_modules ./apps/cell-preview-server/node_modules
# dist/ contains both the Vite frontend bundle and the bundled server.js
COPY --from=build /app/apps/cell-preview-server/dist ./apps/cell-preview-server/dist

EXPOSE 4500
ENV PORT=4500
CMD ["node", "apps/cell-preview-server/dist/server.js"]
