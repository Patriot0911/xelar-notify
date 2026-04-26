import { Module } from '@nestjs/common';
import { AuthModule } from './auth';
import { DatabaseModule } from '@libs/database';
import { AppConfigModule } from '@libs/config';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    AppConfigModule,
  ],
})
export class ApiModule {}
