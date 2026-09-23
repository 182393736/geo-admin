# syntax=docker/dockerfile:1
# 构建上下文必须是 monorepo 根目录：
#   docker compose -f docker-compose.web.yml build
FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/site-shared/package.json packages/site-shared/
COPY apps/site-web/package.json apps/site-web/
RUN pnpm install --filter @site-manage/web... --frozen-lockfile --ignore-scripts

COPY packages/site-shared packages/site-shared
COPY apps/site-web apps/site-web

# 构建期写入 public / 代理目标（生产请用公网域名，容器内可直连）
ARG NUXT_API_BASE
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_SITE_URL
ARG NUXT_PUBLIC_CONSOLE_URL
ARG NUXT_PUBLIC_GEO_API_BASE=/geo-api
ARG NUXT_GEO_API_TARGET
ENV NUXT_API_BASE=$NUXT_API_BASE \
    NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE \
    NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL \
    NUXT_PUBLIC_CONSOLE_URL=$NUXT_PUBLIC_CONSOLE_URL \
    NUXT_PUBLIC_GEO_API_BASE=$NUXT_PUBLIC_GEO_API_BASE \
    NUXT_GEO_API_TARGET=$NUXT_GEO_API_TARGET \
    NITRO_PRESET=node-server \
    NODE_ENV=production

WORKDIR /app/apps/site-web
RUN pnpm exec nuxt build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=5003 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=5003
COPY --from=build /app/apps/site-web/.output ./.output
EXPOSE 5003
CMD ["node", ".output/server/index.mjs"]
