# syntax=docker/dockerfile:1
# 构建上下文 = monorepo 根目录
FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/site-server/package.json apps/site-server/
RUN pnpm install --filter @site-manage/server... --frozen-lockfile --ignore-scripts

FROM deps AS runner
COPY apps/site-server apps/site-server
ENV NODE_ENV=production \
    EGG_SERVER_ENV=prod
EXPOSE 5001
CMD ["pnpm", "--filter", "@site-manage/server", "run", "start:docker"]
