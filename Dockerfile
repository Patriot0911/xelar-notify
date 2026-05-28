FROM node:20-alpine AS deps
WORKDIR /app

ARG APP
ENV APP=${APP}

COPY package.json package-lock.json ./
COPY nest-cli.json tsconfig*.json ./

COPY apps/**/package.json ./apps/
COPY libs/**/package.json ./libs/

# 3. install full workspace graph
RUN npm ci --workspaces --include-workspace-root
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

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

CMD ["node", "dist/apps/${APP}/src/main"]