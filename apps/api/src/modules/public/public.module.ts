import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity, TwitchStreamerEntity } from '@libs/database';
import { PublicStreamersController } from './controllers';
import { PublicStreamersService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitchStreamerEntity,
      NotificationLogEntity,
    ]),
  ],
  controllers: [PublicStreamersController],
  providers: [PublicStreamersService],
  exports: [PublicStreamersService],
})
export class PublicModule {}
