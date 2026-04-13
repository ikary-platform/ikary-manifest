FROM node:20-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY libs ./libs
COPY apps/try-api ./apps/try-api
COPY manifests ./manifests
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ikary/try-api build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/try-api/dist ./dist
COPY --from=build /repo/apps/try-api/package.json ./package.json
COPY --from=build /repo/manifests ./manifests
COPY --from=build /repo/node_modules ./node_modules
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/main.cjs"]
