import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import {
  DiscordNotificationEntity,
  NotificationLogEntity,
  NotificationLogStatus,
  NotificationLogType,
  NotificationStatus,
} from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcPayload } from '@libs/rpc';
import { ISuspendNotificationResult } from '@libs/shared';
import { SuspendNotificationDto } from '../dto';

@Controller()
export class SuspendNotificationHandler {
  private readonly logger = new Logger(SuspendNotificationHandler.name);

  constructor(
    @InjectRepository(DiscordNotificationEntity)
    private readonly notificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(NotificationLogEntity)
    private readonly logsRepository: Repository<NotificationLogEntity>,
  ) {}

  @MessagePattern(RpcPatterns.discord.suspendNotification)
  async handle(@RpcPayload() data: SuspendNotificationDto): Promise<ISuspendNotificationResult> {
    const notification = await this.notificationRepository.findOne({
      where: { id: data.notificationId },
      relations: ['streamerEvent', 'streamerEvent.streamer'],
    });

    if (!notification) {
      this.logger.warn(`Cannot suspend unknown discord notification ${data.notificationId}: ${data.reason}`);
      return { success: true };
    }

    this.logger.warn(`Suspending discord notification ${notification.id}: ${data.reason}`);

    await this.notificationRepository.update(notification.id, { status: NotificationStatus.Suspended });

    await this.logsRepository.save({
      notificationId: notification.id,
      notificationType: NotificationLogType.Discord,
      status: NotificationLogStatus.Failed,
      ownerId: notification.onwerId,
      discordGuildId: notification.discordGuildId ?? null,
      streamerLogin: notification.streamerEvent?.streamer?.twitchLogin ?? '',
      eventType: notification.streamerEvent?.event ?? '',
      requestPayload: notification.messagePayload as Record<string, any> | null,
      errorMessage: data.reason,
    });

    return { success: true };
  }
}
