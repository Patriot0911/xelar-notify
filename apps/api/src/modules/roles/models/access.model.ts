import { Permission } from '@libs/database';

export interface IAccessModel {
  roles: string[];
  permissions: Permission[];
};
