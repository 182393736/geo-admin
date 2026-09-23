# syntax=docker/dockerfile:1
# 构建上下文 = monorepo 根目录
FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/geo-admin/package.json apps/geo-admin/
RUN pnpm install --filter @geo-admin/geo-admin... --frozen-lockfile --ignore-scripts

COPY tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY apps/geo-admin apps/geo-admin
RUN pnpm --filter @geo-admin/contracts build

ARG VITE_API_BASE=https://geo-api.hanyuai.com
ENV VITE_API_BASE=$VITE_API_BASE

RUN pnpm --filter @geo-admin/geo-admin exec vite build

FROM nginx:1.27-alpine
COPY apps/geo-admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/geo-admin/dist /usr/share/nginx/html
EXPOSE 80
