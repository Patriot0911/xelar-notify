import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationLogEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { GetNotificationLogsDto } from '../dto/get-notification-logs.dto';
import { INotificationLogModel } from '../models/notification-log.model';
import { IAccessTokenPayload } from '../../auth/models';
import { DiscordGuildAccessService } from '../../discord/services/discord-guild-access.service';

@Injectable()
export class NotificationLogsService {
  constructor(
    private readonly guildAccess: DiscordGuildAccessService,
    @InjectRepository(NotificationLogEntity)
    private readonly logsRepo: Repository<NotificationLogEntity>,
  ) {}

  async getAll(params: GetNotificationLogsDto): Promise<IGenericListPayloadResponse<INotificationLogModel>> {
    return this.paginate(this.logsRepo.createQueryBuilder('log'), params);
  }

  async getMy(userId: string, params: GetNotificationLogsDto): Promise<IGenericListPayloadResponse<INotificationLogModel>> {
    const qb = this.logsRepo
      .createQueryBuilder('log')
      .where('log.owner_id = :userId', { userId });

    return this.paginate(qb, params);
  }

  async getByGuild(
    guildId: string,
    user: IAccessTokenPayload,
    params: GetNotificationLogsDto,
  ): Promise<IGenericListPayloadResponse<INotificationLogModel>> {
    await this.guildAccess.assertAccess(user.sub, guildId);

    const qb = this.logsRepo
      .createQueryBuilder('log')
      .where('log.guild_id = :guildId', { guildId });

    return this.paginate(qb, params);
  }

  private async paginate(
    qb: ReturnType<typeof this.logsRepo.createQueryBuilder>,
    { page, pageSize }: GetNotificationLogsDto,
  ): Promise<IGenericListPayloadResponse<INotificationLogModel>> {
    const [items, count] = await qb
      .orderBy('log.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: items.map((l) => this.toModel(l)),
      meta: { count },
    };
  }

  private toModel(entity: NotificationLogEntity): INotificationLogModel {
    return {
      id:               entity.id,
      notificationId:   entity.notificationId,
      notificationType: entity.notificationType,
      status:           entity.status,
      ownerId:          entity.ownerId,
      discordGuildId:   entity.discordGuildId ?? null,
      streamerLogin:    entity.streamerLogin,
      eventType:        entity.eventType,
      requestPayload:   entity.requestPayload ?? null,
      errorMessage:     entity.errorMessage ?? null,
      createdAt:        entity.createdAt,
    };
  }
}
