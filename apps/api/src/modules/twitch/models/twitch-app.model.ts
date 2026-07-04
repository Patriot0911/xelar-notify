import { TwitchAppStatus } from '@libs/database/entities/twitch-app.entity';

export interface ITwitchAppShortModel {
  id: string;
  clientId: string;
  name: string;
  createdAt: Date;
  status: TwitchAppStatus;
};

export interface ITwitchAppEncryptOptionsModel {
  webhookSecret?: boolean;
  accessToken?: boolean;
  clientSecret?: boolean;
};
