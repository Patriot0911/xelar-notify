import { AccountStatus } from '@libs/database';

export interface IUserListItemModel {
  id: string;
  displayName: string;
  balance: number;
  status: AccountStatus;
  roles: string[];
  allowPersonalSubscriptions: boolean;
  createdAt: Date;
};
