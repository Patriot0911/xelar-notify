import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';
import Redis from 'ioredis';
import { Global } from '@nestjs/common/decorators';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => {
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        });
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
