FROM node:24-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Astro требует dev-зависимости для сборки
FROM base AS build
ARG FRONTEND_SITE
ARG NOINDEX
RUN pnpm install --frozen-lockfile
COPY frontend ./frontend/
RUN pnpm --filter frontend run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000
RUN pnpm install --prod --frozen-lockfile
COPY --from=build --chown=node:node /app/frontend/dist ./frontend/dist
USER node
WORKDIR /app/frontend
# Хостинг требует один открытый порт
EXPOSE 4000
CMD ["node", "dist/server/entry.mjs"]
