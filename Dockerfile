FROM node:20-alpine AS deps
WORKDIR /app

ARG APP
ENV APP=${APP}

COPY package.json package-lock.json ./

COPY nest-cli.json tsconfig*.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci --include-workspace-root
FROM node:20-alpine AS builder
WORKDIR /app

ARG APP
ENV APP=${APP}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/libs ./libs
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/nest-cli.json ./nest-cli.json
COPY --from=deps /app/tsconfig*.json ./

RUN npm run build:${APP}

FROM node:20-alpine AS runner
WORKDIR /app

ARG APP
ENV APP=${APP}
ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD sh -c "node dist/apps/${APP}/src/main"