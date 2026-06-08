export interface IDiscordGuildModel {
  id: string;
  name: string;
  icon: string;
  banner: string;
  owner: boolean;
  permissions: string;
  features: string[];
  memberCount: number;
  presenceCount: number;
};

export interface IDiscordApiGuildModel {
  id: string;
  name: string;
  icon: string;
  banner: string;
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
};
