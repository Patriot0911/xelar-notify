import { Module } from '@nestjs/common';
import { AdminService } from './services';
import { AdminController } from './controllers';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions';
import { TwitchModule } from '../twitch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchStreamerEventEntity } from '@libs/database';

@Module({
  imports: [
    TwitchSubscriptionsModule,
    TwitchModule,
    TypeOrmModule.forFeature([
      TwitchStreamerEventEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
  ]
})
export class AdminModule {}
