import { Permission } from '@libs/database';

export interface IUserPayload {
  id: string;
  displayName: string;
  discordId?: string | null;
  twitchLogin?: string | null;
  allowPersonalSubscriptions: boolean;
  roles: string[];
  permissions: Permission[];
  balance: number;
};
