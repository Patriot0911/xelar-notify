import { NotificationCostType, NotificationStatus, WebhookType } from '@libs/database';

export interface IDiscordNotificationItemModel {
  id: string;
  status: NotificationStatus;
  costType: NotificationCostType;
  cost: number;
  channelId: string;
  discordGuildId: string;
  streamerEventId: string;
  createdAt: Date;
}

export interface IWebhookNotificationItemModel {
  id: string;
  status: NotificationStatus;
  costType: NotificationCostType;
  cost: number;
  type: WebhookType;
  discordGuildId: string | null;
  streamerEventId: string;
  createdAt: Date;
}

export interface IUserSubscriptionsModel {
  discord: IDiscordNotificationItemModel[];
  webhook: IWebhookNotificationItemModel[];
}
