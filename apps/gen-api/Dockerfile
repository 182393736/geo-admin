# syntax=docker/dockerfile:1
# 构建上下文必须是 monorepo 根目录：
#   docker compose -f apps/gen-api/docker-compose.yml build
FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/geo-agent/package.json packages/geo-agent/
COPY apps/gen-api/package.json apps/gen-api/
RUN pnpm install --filter @geo-admin/gen-api... --frozen-lockfile

FROM deps AS runner
COPY packages/geo-agent packages/geo-agent
COPY apps/gen-api apps/gen-api
ENV NODE_ENV=production \
    EGG_SERVER_ENV=prod \
    PORT=6001 \
    BIND_HOST=0.0.0.0
EXPOSE 6001
CMD ["pnpm", "--filter", "@geo-admin/gen-api", "run", "start:docker"]
