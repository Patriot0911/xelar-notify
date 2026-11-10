import { DiscordPermissionFlag } from '@libs/database';

export interface IDiscordGuildModel {
  id: string;
  name: string;
  /** Icon hash, `null` when the server has no icon. */
  icon: string | null;
  /** Banner hash, `null` when the server has no banner (boost-level feature). */
  banner: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  memberCount: number;
  presenceCount: number;
};

export interface IDiscordApiGuildModel {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count: number;
  approximate_presence_count: number;
};

export interface IDiscordUserGuildItemModel extends IDiscordGuildModel {
  hasBot: boolean;
  balance: number;
  notificationCount: number;
  managerPermission?: DiscordPermissionFlag;
};

export interface IDiscordGuildInfoModel extends IDiscordUserGuildItemModel {
  botNotificationCount: number;
  webhookNotificationCount: number;
  /** Distinct Twitch events (streamer + event type) this server is notified about. */
  subscriptionCount: number;
};
