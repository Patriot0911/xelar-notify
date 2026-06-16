import { AccountStatus } from '@libs/database';

export interface IUserItemModel {
  id: string;
  displayName: string;
  balance: number;
  status: AccountStatus;
  email: string | null;
  discordId: string | null;
  roles: string[];
  allowPersonalSubscriptions: boolean;
  twitchLogin: string | null;
  createdAt: Date;
};
