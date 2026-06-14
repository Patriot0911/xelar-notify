import { ISearchStreamersPayload } from '@libs/shared';
import { IsString } from 'class-validator';

export class SearchStreamersDto implements ISearchStreamersPayload {
  @IsString()
  search: string;
}
