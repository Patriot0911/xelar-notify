FROM node:20-alpine AS deps
WORKDIR /app

ARG APP
ENV APP=${APP}

COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/webhook-receiver/package.json ./apps/webhook-receiver/
COPY apps/notification-worker/package.json ./apps/notification-worker/
COPY apps/discord-bot/package.json ./apps/discord-bot/

RUN npm ci --workspace=apps/${APP} --include-workspace-root

FROM node:20-alpine AS builder
WORKDIR /app

ARG APP
ENV APP=${APP}

COPY --from=deps /app/package*.json ./

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps

COPY tsconfig*.json nest-cli.json ./
COPY libs ./libs
COPY apps/${APP}/ ./apps/${APP}/

RUN npm run build:${APP}

FROM node:20-alpine AS runner
WORKDIR /app

ARG APP
ENV APP=${APP}
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/${APP}/package.json ./apps/${APP}/

RUN npm ci --omit=dev --workspace=apps/${APP} --include-workspace-root

RUN if [ -d /app/apps/${APP}/node_modules ]; then \
      cp -rn /app/apps/${APP}/node_modules/. /app/node_modules/ 2>/dev/null || true; \
    fi

COPY --from=builder /app/dist/apps/${APP} ./dist

CMD ["node", "dist/main"]