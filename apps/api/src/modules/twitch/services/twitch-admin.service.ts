import { TwitchAppEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IGenericListPayloadResponse, IPaginationFilters } from 'apps/api/src/shared';
import { Repository } from 'typeorm';
import { TwitchAppMapper } from '../mappers';
import { ITwitchAppShortModel } from '../models';

@Injectable()
export class TwitchAdminService {
  constructor(
    @InjectRepository(TwitchAppEntity)
    private readonly twitchAppsRepository: Repository<TwitchAppEntity>,
    private readonly twitchAppMapper: TwitchAppMapper,
  ) {}

  async getAllTwitchApps(params: IPaginationFilters): Promise<IGenericListPayloadResponse<ITwitchAppShortModel>> {
    const { page, pageSize, } = params;

    const appQb = this.twitchAppsRepository
      .createQueryBuilder('twApps')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [appsData, total] = await appQb
      .distinct(true)
      .getManyAndCount();

    return {
      items: appsData.map(
        (s) => this.twitchAppMapper.EntityToListItem(s)
      ),
      meta: { count: total, },
    };
  }
}
