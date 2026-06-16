import { IPaginationFilters } from 'apps/api/src/shared';

export interface IGetUsersFiltersModel extends IPaginationFilters {
  search?: string;
};
