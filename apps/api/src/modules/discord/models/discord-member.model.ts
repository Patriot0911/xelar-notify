import { IDiscordApiMeModel, IDiscordMeModel } from './discord-me.model';

export interface IDiscordGuildMemberModel {
  user?: IDiscordMeModel;
  nick?: string | null;
  avatar?: string |null;
  premiumSince?: string | null;
  permissions?: string | null;
  roles: string[];
  joinedAt: string;
  deaf: boolean;
  mute: boolean;
};

export interface IDiscordApiGuildMemberModel {
  user?: IDiscordApiMeModel;
  nick?: string | null;
  avatar?: string |null;
  premium_since?: string | null;
  permissions?: string | null;
  roles: string[];
  joined_at: string;
  deaf: boolean;
  mute: boolean;
};
