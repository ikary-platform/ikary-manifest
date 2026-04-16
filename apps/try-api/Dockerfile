ARG NODE_VERSION=24.14.1
FROM node:${NODE_VERSION}-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Install deps (filtered to try-api and its transitive workspace deps) ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY libs/cell-contract/package.json libs/cell-contract/package.json
COPY libs/system-ai/package.json libs/system-ai/package.json
COPY libs/system-prompt/package.json libs/system-prompt/package.json
COPY libs/cell-ai/package.json libs/cell-ai/package.json
COPY apps/try-api/package.json apps/try-api/package.json
RUN pnpm install --frozen-lockfile --filter @ikary/try-api...

# ── Build ──
FROM deps AS build
COPY libs/cell-contract/ libs/cell-contract/
COPY libs/system-ai/ libs/system-ai/
COPY libs/system-prompt/ libs/system-prompt/
COPY libs/cell-ai/ libs/cell-ai/
COPY apps/try-api/ apps/try-api/
COPY manifests/ manifests/
COPY prompts/ prompts/
RUN pnpm --filter @ikary/cell-contract build \
 && pnpm --filter @ikary/system-ai build \
 && pnpm --filter @ikary/system-prompt build \
 && pnpm --filter @ikary/cell-ai build \
 && pnpm --filter @ikary/try-api build

# ── Production image ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/try-api/node_modules ./apps/try-api/node_modules
COPY --from=build /app/apps/try-api/dist ./apps/try-api/dist
COPY --from=build /app/apps/try-api/package.json ./apps/try-api/package.json
COPY --from=build /app/manifests ./manifests
COPY --from=build /app/prompts ./prompts

EXPOSE 8080
ENV PORT=8080
CMD ["node", "apps/try-api/dist/main.cjs"]
