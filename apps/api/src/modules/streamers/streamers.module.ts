import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity, TwitchStreamerEntity } from '@libs/database';
import { TwitchModule } from '../twitch';
import { StreamersController } from './controllers';
import { StreamersService } from './services';
import { StreamersMapper } from './mappers/streamers.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitchStreamerEntity,
      NotificationLogEntity,
    ]),
    TwitchModule,
  ],
  controllers: [StreamersController],
  providers: [StreamersService, StreamersMapper],
})
export class StreamersModule {}
