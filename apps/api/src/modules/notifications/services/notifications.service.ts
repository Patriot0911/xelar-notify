import { BadRequestException, Injectable } from '@nestjs/common';
import {
  NotificationCostType,
  WebhookType,
} from '@libs/database';
import { DiscordPayloadService } from '../../notification-payload/services';
import { NotificationPrice } from '../notifications.constants';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly discordPayloadService: DiscordPayloadService,
  ) {}

  detectWebhookType(url: string): WebhookType {
    if (/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url)) {
      return WebhookType.DISCORD;
    }
    throw new BadRequestException('Unsupported webhook URL — only Discord webhooks are supported');
  }

  validateWebhookPayload(type: WebhookType, payload: Record<string, unknown>): void {
    switch (type) {
      case WebhookType.DISCORD:
        this.discordPayloadService.validatePayload(payload);
        break;
    }
  }

  resolveCost(costType: NotificationCostType): number {
    if (costType === NotificationCostType.Credit) {
      return NotificationPrice.FREE;
    }
    return NotificationPrice.STANDARD;
  }
}
