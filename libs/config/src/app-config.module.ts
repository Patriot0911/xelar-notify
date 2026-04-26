import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './validate';
import { databaseConfig, authConfig, redisConfig, rabbitConfig, featureConfig } from './configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [
        authConfig,
        databaseConfig,
        redisConfig,
        rabbitConfig,
        featureConfig,
      ],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
