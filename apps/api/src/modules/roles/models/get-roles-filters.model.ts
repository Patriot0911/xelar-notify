import { IPaginationFilters } from 'apps/api/src/shared';

export interface IGetRolesFiltersModel extends IPaginationFilters {
  search?: string;
};
