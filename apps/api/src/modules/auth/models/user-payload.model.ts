import { Permission } from '@libs/database';

export interface IUserPayload {
  id: string;
  displayName: string;
  discordId?: string | null;
  roles: string[];
  permissions: Permission[];
};
