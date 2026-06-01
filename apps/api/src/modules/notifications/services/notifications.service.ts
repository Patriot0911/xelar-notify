import { BadRequestException, Injectable } from '@nestjs/common';
import {
  NotificationCostType,
  WebhookType,
} from '@libs/database';
import { NotificationPrice } from '../notifications.constants';

@Injectable()
export class NotificationsService {
  detectWebhookType(url: string): WebhookType {
    if (/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url)) {
      return WebhookType.DISCORD;
    }
    throw new BadRequestException('Unsupported webhook URL — only Discord webhooks are supported');
  }

  resolveCost(costType: NotificationCostType): number {
    if (costType === NotificationCostType.Credit) {
      return NotificationPrice.FREE;
    }
    return NotificationPrice.STANDARD;
  }
}
