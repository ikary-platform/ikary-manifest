FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/contract/package.json libs/contract/package.json
COPY libs/engine/package.json libs/engine/package.json
COPY libs/loader/package.json libs/loader/package.json
COPY libs/presentation/package.json libs/presentation/package.json
COPY libs/primitive-contract/package.json libs/primitive-contract/package.json
COPY libs/primitive-studio/package.json libs/primitive-studio/package.json
COPY libs/primitives/package.json libs/primitives/package.json
COPY libs/renderer/package.json libs/renderer/package.json
COPY apps/preview-server/package.json apps/preview-server/package.json
RUN pnpm install --frozen-lockfile --filter @ikary/preview-server...

# ── Build ──
FROM deps AS build
COPY libs/contract/ libs/contract/
COPY libs/engine/ libs/engine/
COPY libs/loader/ libs/loader/
COPY libs/presentation/ libs/presentation/
COPY libs/primitive-contract/ libs/primitive-contract/
COPY libs/primitive-studio/ libs/primitive-studio/
COPY libs/primitives/ libs/primitives/
COPY libs/renderer/ libs/renderer/
COPY apps/preview-server/ apps/preview-server/
RUN pnpm --filter @ikary/contract build \
 && pnpm --filter @ikary/engine build \
 && pnpm --filter @ikary/loader build \
 && pnpm --filter @ikary/presentation build \
 && pnpm --filter @ikary/primitive-contract build \
 && pnpm --filter @ikary/primitive-studio build \
 && pnpm --filter @ikary/primitives build \
 && pnpm --filter @ikary/renderer build \
 && pnpm --filter @ikary/preview-server build \
 && pnpm --filter @ikary/preview-server build:server

# ── Production image ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/preview-server/node_modules ./apps/preview-server/node_modules
# dist/ contains both the Vite frontend bundle and the bundled server.js
COPY --from=build /app/apps/preview-server/dist ./apps/preview-server/dist

EXPOSE 4500
ENV PORT=4500
CMD ["node", "apps/preview-server/dist/server.js"]
