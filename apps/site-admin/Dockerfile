# syntax=docker/dockerfile:1
# 构建上下文 = monorepo 根目录
FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/site-shared/package.json packages/site-shared/
COPY apps/site-admin/package.json apps/site-admin/
RUN pnpm install --filter @site-manage/admin... --frozen-lockfile --ignore-scripts

COPY packages/site-shared packages/site-shared
COPY apps/site-admin apps/site-admin
RUN pnpm --filter @site-manage/admin exec vite build

FROM nginx:1.27-alpine
COPY apps/site-admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/site-admin/dist /usr/share/nginx/html
EXPOSE 80
