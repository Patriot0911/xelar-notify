import { z } from 'zod';

export const configSchema = z.object({
  // General
  NODE_ENV:              z.enum(['development', 'production']).default('development'),
  API_PORT:              z.coerce.number().default(3000),
  WEBHOOK_RECEIVER_PORT: z.coerce.number().default(3001),

  // Auth
  JWT_SECRET_ACCESS:  z.string(),
  JWT_SECRET_REFRESH:  z.string(),
  JWT_TTL_ACCESS:  z.coerce.number().default(3600),
  JWT_TTL_REFRESH:  z.coerce.number().default(86400),

  // Discord
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),

  // Postgresql
  DB_HOST:     z.string(),
  DB_PORT:     z.coerce.number().default(5432),
  DB_USER:     z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME:     z.string(),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_USER: z.string(),
  REDIS_PASSWORD: z.string(),

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
  RABBIT_TELEGRAM_USER:     z.string(),
  RABBIT_TELEGRAM_PASSWORD: z.string(),
});

export type AppConfig = z.infer<typeof configSchema>;