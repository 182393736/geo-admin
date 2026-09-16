# syntax=docker/dockerfile:1
# 构建上下文 = monorepo 根目录
FROM node:20-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/gen-user-site/package.json apps/gen-user-site/
RUN pnpm install --filter @geo-admin/gen-user-site... --frozen-lockfile
COPY apps/gen-user-site apps/gen-user-site
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_CONSOLE_URL
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE \
    NUXT_PUBLIC_CONSOLE_URL=$NUXT_PUBLIC_CONSOLE_URL \
    NITRO_PRESET=node-server
WORKDIR /app/apps/gen-user-site
RUN pnpm exec nuxt build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000
COPY --from=build /app/apps/gen-user-site/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
