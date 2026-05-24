import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TwitchAppsRepository } from '../repositories';
import { IGenericListPayloadResponse, IPaginationFilters } from 'apps/api/src/shared';
import { ITwitchAppShortModel } from '../models';
import { TwitchAppMapper } from '../mappers';
import crypto from 'node:crypto';
import { AddTwitchAppDto, EditTwitchAppDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchStreamerEventEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { TwitchAppAuthService } from './twitch-app-auth.service';

@Injectable()
export class TwitchAppService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchAppsMapper: TwitchAppMapper,
    private readonly twitchAuthService: TwitchAppAuthService,
    @InjectRepository(TwitchStreamerEventEntity)
    private twitchStreamerEventsRepository: Repository<TwitchStreamerEventEntity>,
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
        (s) => this.twitchAppsMapper.entityToListItem(s)
      ),
      meta: { count: total, },
    };
  }

  async getById(id: string) {
    const twitchApp = await this.twitchAppsRepository.findOne({
      where: { id, }
    });

    if (!twitchApp) {
      throw new BadRequestException(`Cannot find Twitch App with id "${id}"`);
    }

    return this.twitchAppsMapper.entityToListItem(twitchApp);
  }

  async addTwitchApp(dto: AddTwitchAppDto): Promise<ITwitchAppShortModel> {
    const existingTwitchApp = await this.twitchAppsRepository.findOne({
      where: { clientId: dto.clientId, }
    });

    if (existingTwitchApp) {
      throw new BadRequestException(`Twitch app with clientId "${dto.clientId}" already exists.`);
    }

    const tokenData = await this.twitchAuthService.fetchToken(dto.clientId, dto.clientSecret);
    const webhookSecret = !dto.webhookSecret
      ? crypto.randomBytes(32).toString('hex')
      : dto.webhookSecret;

    const twitchApp = await this.twitchAppsRepository.saveApp({
      name:           dto.name,
      clientId:       dto.clientId,
      clientSecret:   dto.clientSecret,
      webhookSecret:  webhookSecret,
      accessToken:    tokenData.access_token,
      tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000)
    });

    return this.twitchAppsMapper.entityToListItem(twitchApp);
  }

  async editTwitchApp(appId: string, dto: EditTwitchAppDto): Promise<ITwitchAppShortModel> {
    const twitchApp = await this.twitchAppsRepository.findOne({
      where: { id: appId, }
    }, true);

    if (!twitchApp) {
      throw new NotFoundException(`Twitch App with ID ${appId} not found`);
    }

    if (twitchApp.webhookSecret && dto.webhookSecret) {
      const appEvents = await this.twitchStreamerEventsRepository.count({
        where: { twitchApp: { id: appId, }, }
      });
      if (appEvents > 0) {
        throw new BadRequestException(`Cannot replace existing webhook secret for app with id ${appId}`);
      }
    }
    Object.assign(twitchApp, dto);
    const savedApp = await this.twitchAppsRepository.saveApp(twitchApp);
    return this.twitchAppsMapper.entityToListItem(savedApp);
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

  async releaseAppCost(clientId: string, cost: number) {
    await this.twitchAppsRepository.decrement(
      { clientId },
      'currentCost',
      cost,
    );
  }
}
