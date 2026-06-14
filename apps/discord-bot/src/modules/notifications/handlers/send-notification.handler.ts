import type { IDiscordNotificationMessage } from '@libs/queue';
import { QueuePatterns } from '@libs/queue';
import { RpcService } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { ISuspendNotificationPayload, ISuspendNotificationResult } from '@libs/shared';
import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { Client, MessageCreateOptions, TextChannel } from 'discord.js';
import { DISCORD_CLIENT } from '../../../shared/constants';

@Controller()
export class SendNotificationHandler {
  private readonly logger = new Logger(SendNotificationHandler.name);

  constructor(
    @Inject(DISCORD_CLIENT)
    private readonly client: Client,
    private readonly rpc: RpcService,
  ) {}

  @EventPattern(QueuePatterns.discord.notifications.send)
  async handle(@Payload() data: IDiscordNotificationMessage) {
    try {
      const channel = await this.client.channels.fetch(data.channelId);

      if (!channel?.isTextBased()) {
        this.logger.warn(`Channel ${data.channelId} is not text-based or not found`);
        await this.suspend(data.notificationId, 'Channel is not text-based or not found');
        return;
      }

      await (<TextChannel> channel)!.send(data.messagePayload as MessageCreateOptions);
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      this.logger.error(`Failed to send notification to channel ${data.channelId}: ${reason}`);
      await this.suspend(data.notificationId, reason);
    }
  }

  private async suspend(notificationId: string, reason: string) {
    const res = await this.rpc.callSafe<ISuspendNotificationResult, ISuspendNotificationPayload>(
      RpcPatterns.discord.suspendNotification,
      { notificationId, reason },
    );

    if (!res.status) {
      this.logger.error(`Failed to suspend notification ${notificationId} via RPC`, res.data);
    }
  }
}
