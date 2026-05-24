import { Permission } from '@libs/database';

export interface IEditRoleModel {
  name: string;
  permissions: Permission[];
  rolePriority?: number;
};
