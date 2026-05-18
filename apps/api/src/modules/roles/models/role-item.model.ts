import { Permission } from '@libs/database';

export interface IRoleItemModel {
  id: string;
  name: string;
  rolePriority: number;
  permissions: Permission[];
};
