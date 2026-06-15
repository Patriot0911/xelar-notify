import { z } from 'zod';

export const configSchema = z.object({
  // General
  NODE_ENV:              z.enum(['development', 'production']).default('development'),
  API_PORT:              z.coerce.number().default(3000),
  API_TCP_PORT:          z.coerce.number().default(3010),
  API_HOST:              z.string().default('localhost'),
  BOT_TCP_PORT:          z.coerce.number().default(3011),
  BOT_HOST:              z.string().default('localhost'),
  WEBHOOK_RECEIVER_PORT: z.coerce.number().default(3001),
  ENCRYPTION_KEY:        z.string(),
  ENCRYPTION_SALT:       z.string(),
  TWITCH_WEBHOOK_URL:    z.url(),
  TWITCH_AUTH_REDIRECT_URI: z.url(),

  // Auth
  JWT_SECRET_ACCESS:  z.string(),
  JWT_SECRET_REFRESH:  z.string(),
  JWT_TTL_ACCESS:  z.coerce.number().default(3600),
  JWT_TTL_REFRESH:  z.coerce.number().default(86400),

  // Discord
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_API_URL: z.string(),

  // Postgresql
  DB_HOST:     z.string(),
  DB_PORT:     z.coerce.number().default(5432),
  DB_USER:     z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME:     z.string(),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),

  // RabbitMQ
  RABBIT_HOST:     z.string(),
  RABBIT_PORT:     z.coerce.number().default(5672),
  RABBIT_VHOST:    z.string().default('/'),
  RABBIT_USER:     z.string(),
  RABBIT_PASSWORD: z.string(),

  // RabbitMQ users
  RABBIT_RECEIVER_USER:     z.string(),
  RABBIT_RECEIVER_PASSWORD: z.string(),
  RABBIT_API_USER:          z.string(),
  RABBIT_API_PASSWORD:      z.string(),
  RABBIT_DISCORD_USER:      z.string(),
  RABBIT_DISCORD_PASSWORD:  z.string(),
  RABBIT_WORKER_USER:       z.string(),
  RABBIT_WORKER_PASSWORD:   z.string(),
});

export type AppConfig = z.infer<typeof configSchema>;