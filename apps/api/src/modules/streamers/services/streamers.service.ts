import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLogEntity, TwitchStreamerEntity } from '@libs/database';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { TwitchApiService } from '../../twitch/services';
import { StreamersMapper } from '../mappers/streamers.mapper';
import { IGetStreamersFiltersModel, IStreamerItemModel, IStreamerListItemModel, IStreamerNotificationLogModel } from '../models';
import { UpdateStreamerDto } from '../dto';

@Injectable()
export class StreamersService {
  constructor(
    private readonly streamersMapper: StreamersMapper,
    private readonly twitchApiService: TwitchApiService,
    @InjectRepository(TwitchStreamerEntity)
    private readonly streamersRepository: Repository<TwitchStreamerEntity>,
    @InjectRepository(NotificationLogEntity)
    private readonly notificationLogsRepository: Repository<NotificationLogEntity>,
  ) {}

  async getAll(params: IGetStreamersFiltersModel): Promise<IGenericListPayloadResponse<IStreamerListItemModel>> {
    const { page, pageSize, search } = params;
    const qb = this.streamersRepository
      .createQueryBuilder('streamer')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('streamer.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        '(streamer.displayName ILIKE :search OR streamer.twitchLogin ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, count] = await qb.getManyAndCount();

    return {
      items: items.map((s) => this.streamersMapper.entityToListItem(s)),
      meta: { count },
    };
  }

  async getById(streamerId: string): Promise<IStreamerItemModel> {
    const streamer = await this.findOrThrow(streamerId, ['user']);
    return this.streamersMapper.entityToItem(streamer);
  }

  async update(streamerId: string, dto: UpdateStreamerDto): Promise<IStreamerItemModel> {
    const streamer = await this.findOrThrow(streamerId, ['user']);

    if (dto.isInternal !== undefined) streamer.isInternal = dto.isInternal;

    await this.streamersRepository.save(streamer);
    return this.streamersMapper.entityToItem(streamer);
  }

  async syncFromTwitch(streamerId: string): Promise<IStreamerItemModel> {
    const streamer = await this.findOrThrow(streamerId, ['user']);

    const twitchUser = await this.twitchApiService.getUserById(streamer.broadcasterId);
    if (!twitchUser) {
      throw new BadRequestException('Could not fetch this streamer from Twitch');
    }

    streamer.twitchLogin = twitchUser.login;
    streamer.displayName = twitchUser.displayName;
    streamer.profileImageUrl = twitchUser.profileImageUrl;
    streamer.profileImageUpdatedAt = new Date();
    streamer.isPartner = twitchUser.broadcasterType === 'partner';

    await this.streamersRepository.save(streamer);
    return this.streamersMapper.entityToItem(streamer);
  }

  async getNotificationLogs(streamerId: string): Promise<IStreamerNotificationLogModel[]> {
    const streamer = await this.findOrThrow(streamerId);

    const logs = await this.notificationLogsRepository.find({
      where: { streamerLogin: streamer.twitchLogin },
      order: { createdAt: 'DESC' },
    });

    return logs.map((log) => this.streamersMapper.notificationLogToItem(log));
  }

  private async findOrThrow(streamerId: string, relations: string[] = []): Promise<TwitchStreamerEntity> {
    const streamer = await this.streamersRepository.findOne({
      where: { id: streamerId },
      relations,
    });

    if (!streamer) {
      throw new NotFoundException(`Streamer "${streamerId}" not found`);
    }

    return streamer;
  }
}
