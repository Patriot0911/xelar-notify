import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IGenericListPayloadResponse, IPaginationFilters } from 'apps/api/src/shared';
import { TwitchAppMapper } from '../mappers';
import { ITwitchAppShortModel } from '../models';
import { AddTwitchAppDto, EditTwitchAppDto } from '../dto';
import { TwitchAuthService } from './twitch-auth.service';
import { TwitchAppsRepository } from '../repositories';

@Injectable()
export class TwitchAdminService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchAppMapper: TwitchAppMapper,
    private readonly twitchAuthService: TwitchAuthService,
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

  async addTwitchApp(dto: AddTwitchAppDto): Promise<ITwitchAppShortModel> {
    const existingTwitchApp = await this.twitchAppsRepository.findOne({
      where: { clientId: dto.clientId, }
    });

    if (existingTwitchApp) {
      throw new BadRequestException(`Twitch app with clientId "${dto.clientId}" already exists.`);
    }

    const tokenData = await this.twitchAuthService.fetchToken(dto.clientId, dto.clientSecret);

    const twitchApp = await this.twitchAppsRepository.saveApp({
      name:           dto.name,
      clientId:       dto.clientId,
      clientSecret:   dto.clientSecret,
      accessToken:    tokenData.access_token,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
    });

    return this.twitchAppMapper.EntityToListItem(twitchApp);
  }

  async editTwitchApp(appId: string, dto: EditTwitchAppDto): Promise<ITwitchAppShortModel> {
    const twitchApp = await this.twitchAppsRepository.findOne({
      where: { id: appId, }
    }, true);
    if (!twitchApp) {
      throw new NotFoundException(`Twitch App with ID ${appId} not found`);
    }
    Object.assign(twitchApp, dto);
    const savedApp = await this.twitchAppsRepository.saveApp(twitchApp);
    return this.twitchAppMapper.EntityToListItem(savedApp);
  }

  async deleteTwitchApp(appId: string): Promise<boolean> {
    const twitchApp = await this.twitchAppsRepository.findOne({
      where: { id: appId, }
    });
    if (!twitchApp) {
      throw new NotFoundException(`Twitch App with ID ${appId} not found`);
    }
    const removedApp = await this.twitchAppsRepository.remove(twitchApp);
    return !!removedApp;
  }
}
