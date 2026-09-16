# syntax=docker/dockerfile:1
# 构建上下文 = monorepo 根目录
FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/gen-user-dash/package.json apps/gen-user-dash/
# 根 package.json 的 postinstall 会 build contracts；此时源码尚未 COPY，必须跳过 scripts
RUN pnpm install --filter @geo-admin/gen-user-dash... --frozen-lockfile --ignore-scripts
COPY packages/contracts packages/contracts
COPY apps/gen-user-dash apps/gen-user-dash
RUN pnpm --filter @geo-admin/contracts build
ARG VITE_API_BASE
ARG VITE_ARTICLE_BASE
ARG VITE_SITE_URL
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_ARTICLE_BASE=$VITE_ARTICLE_BASE \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_USE_MOCK=$VITE_USE_MOCK
RUN pnpm --filter @geo-admin/gen-user-dash exec vite build

FROM nginx:1.27-alpine
COPY apps/gen-user-dash/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/gen-user-dash/dist /usr/share/nginx/html
EXPOSE 80
