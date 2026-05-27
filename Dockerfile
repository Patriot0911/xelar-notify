FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

ARG APP
ENV APP=${APP}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -f apps/${APP}/package.json ]; then \
      cd apps/${APP} && npm ci; \
    fi

RUN npm run build:${APP}

FROM node:20-alpine AS runner
WORKDIR /app

ARG APP
ENV APP=${APP}
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY apps/${APP}/package*.json* ./apps/${APP}/
RUN if [ -f apps/${APP}/package.json ]; then \
      cd apps/${APP} && npm ci --omit=dev; \
    fi

COPY --from=builder /app/dist ./dist

CMD sh -c "node dist/apps/${APP}/src/main"