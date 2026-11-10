import { SearchPaginationDto } from 'apps/api/src/shared';
import { IGetUsersFiltersModel } from '../models';

/** `?page=&pageSize=&search=` — search matches display name, email, Discord ID, Twitch login or user ID. */
export class GetUsersRequestDto extends SearchPaginationDto implements IGetUsersFiltersModel {};
