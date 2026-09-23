# syntax=docker/dockerfile:1
# 构建上下文必须是 monorepo 根目录：
#   docker compose -f docker-compose.web.yml build
FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/geo-user-dash-v2/package.json apps/geo-user-dash-v2/
# 根 postinstall 会 build contracts；源码尚未 COPY，跳过 scripts
RUN pnpm install --filter @geo-admin/geo-user-dash-v2... --frozen-lockfile --ignore-scripts

COPY tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY apps/geo-user-dash-v2 apps/geo-user-dash-v2
RUN pnpm --filter @geo-admin/contracts build

ARG VITE_API_BASE
ARG VITE_ARTICLE_BASE
ARG VITE_SITE_URL
ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_ARTICLE_BASE=$VITE_ARTICLE_BASE \
    VITE_SITE_URL=$VITE_SITE_URL

RUN pnpm --filter @geo-admin/geo-user-dash-v2 exec vite build

FROM nginx:1.27-alpine
COPY apps/geo-user-dash-v2/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/geo-user-dash-v2/dist /usr/share/nginx/html
EXPOSE 80
