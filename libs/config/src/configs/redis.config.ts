import { registerAs } from '@nestjs/config';
import { IRedisConfigModel } from '../models';

const REDIS_KEY = 'redis';

export const redisConfig = registerAs<IRedisConfigModel>(REDIS_KEY, () => ({
  host:     process.env.REDIS_HOST!,
  port:     Number(process.env.REDIS_PORT!) || 6379,
  user:     process.env.REDIS_USER!,
  password: process.env.REDIS_PASSWORD!,
}));

export type RedisConfig = ReturnType<typeof redisConfig>;
