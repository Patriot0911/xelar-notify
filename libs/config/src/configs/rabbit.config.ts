import { registerAs } from '@nestjs/config';
import { IRabbitConfigModel } from '../models';

const RABBIT_KEY = 'rabbit';

export const rabbitConfig = registerAs<IRabbitConfigModel>(RABBIT_KEY, () => ({
  host: process.env.RABBIT_HOST!,
  port: Number(process.env.RABBIT_PORT!) || 5672,
  user: process.env.RABBIT_USER!,
  password: process.env.RABBIT_PASSWORD!,

  users: {
    api: {
      user: process.env.RABBIT_API_USER!,
      password: process.env.RABBIT_API_PASSWORD!,
    },
    receiver: {
      user: process.env.RABBIT_RECEIVER_USER!,
      password: process.env.RABBIT_RECEIVER_PASSWORD!,
    },
    discord: {
      user: process.env.RABBIT_DISCORD_USER!,
      password: process.env.RABBIT_DISCORD_PASSWORD!,
    },
    worker: {
      user: process.env.RABBIT_WORKER_USER!,
      password: process.env.RABBIT_WORKER_PASSWORD!,
    },
  },
}));

export type RabbitConfig = ReturnType<typeof rabbitConfig>;
