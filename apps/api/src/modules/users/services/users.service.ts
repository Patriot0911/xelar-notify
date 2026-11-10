import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  IGetUsersFiltersModel,
  IUserItemModel,
  IUserListItemModel,
  IUserNotificationLogModel,
  IUserSessionModel,
} from '../models';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AccountStatus,
  DiscordNotificationEntity,
  NotificationLogEntity,
  Permission,
  RoleEntity,
  UserEntity,
  UserSessionEntity,
  WebhookNotificationEntity,
} from '@libs/database';
import { In, MoreThan, Repository } from 'typeorm';
import { UsersMapper } from '../mappers/users.mapper';
import { GetNotificationLogsDto } from '../../notification-logs/dto/get-notification-logs.dto';
import { GetGuildNotificationsDto } from '../../notifications/dto/get-guild-notifications.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersMapper: UsersMapper,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserSessionEntity)
    private sessionsRepository: Repository<UserSessionEntity>,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,
    @InjectRepository(DiscordNotificationEntity)
    private discordNotificationsRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(WebhookNotificationEntity)
    private webhookNotificationsRepository: Repository<WebhookNotificationEntity>,
    @InjectRepository(NotificationLogEntity)
    private notificationLogsRepository: Repository<NotificationLogEntity>,
  ) {}

  async getAll(params: IGetUsersFiltersModel): Promise<IGenericListPayloadResponse<IUserListItemModel>> {
    const { page, pageSize, search } = params;
    const usersQb = this.usersRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoin('users.twitchAccount', 'twitchAccount')
      .addSelect('twitchAccount.allowPersonalSubscriptions')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (search) {
      usersQb.andWhere('users.displayName LIKE :search', { search });
    }

    const [usersData, total] = await usersQb.distinct(true).getManyAndCount();

    return {
      items: usersData.map((u) => this.usersMapper.entityToListItem(u)),
      meta: { count: total },
    };
  }

  async getById(userId: string): Promise<IUserItemModel> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { twitchAccount: true, roles: true },
    });

    if (!user) {
      throw new BadRequestException(`Cannot find User with id "${userId}"`);
    }

    return this.usersMapper.entityToItem(user);
  }

  async getUserSessions(userId: string): Promise<IUserSessionModel[]> {
    const sessions = await this.sessionsRepository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    return sessions.map((s) => this.usersMapper.sessionToModel(s));
  }

  async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionsRepository.remove(session);
  }

  async updateUserRoles(
    currentUserId: string,
    currentUserPermissions: Permission[],
    targetUserId: string,
    roleIds: string[],
  ): Promise<void> {
    const isAdmin = currentUserPermissions.includes(Permission.ADMIN);

    const newRoles = roleIds.length
      ? await this.rolesRepository.findBy({ id: In(roleIds) })
      : [];

    if (!isAdmin) {
      const [currentUserRoles, targetUser] = await Promise.all([
        this.rolesRepository.find({ where: { users: { id: currentUserId } } }),
        this.usersRepository.findOne({ where: { id: targetUserId }, relations: { roles: true } }),
      ]);

      if (!targetUser) {
        throw new NotFoundException(`User "${targetUserId}" not found`);
      }

      const currentMaxPriority = Math.max(0, ...currentUserRoles.map((r) => r.rolePriority));
      const targetMaxPriority = Math.max(0, ...targetUser.roles.map((r) => r.rolePriority));

      if (targetMaxPriority >= currentMaxPriority) {
        throw new ForbiddenException('Cannot edit roles of a user with equal or higher role priority');
      }

      const newMaxPriority = Math.max(0, ...newRoles.map((r) => r.rolePriority));
      if (newMaxPriority >= currentMaxPriority) {
        throw new ForbiddenException('Cannot assign roles with equal or higher priority than your own');
      }
    }

    const user = await this.usersRepository.findOne({
      where: { id: targetUserId },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`User "${targetUserId}" not found`);
    }

    user.roles = newRoles;
    await this.usersRepository.save(user);
  }

  async updateUserStatus(userId: string, status: AccountStatus): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    await this.usersRepository.update(userId, { status });
  }

  async updateUserBalance(userId: string, balance: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    await this.usersRepository.update(userId, { balance });
  }

  /** Discord bot notifications created by the user (paid from their balance or their guild's). */
  async getUserBotSubscriptions(
    userId: string,
    { page, pageSize }: GetGuildNotificationsDto,
  ): Promise<IGenericListPayloadResponse<DiscordNotificationEntity>> {
    const [items, count] = await this.discordNotificationsRepository.findAndCount({
      where: { onwerId: userId },
      order: { createdAt: 'DESC' },
      relations: { guild: true, streamerEvent: { streamer: true } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, meta: { count } };
  }

  /** Webhook notifications created by the user. */
  async getUserWebhookSubscriptions(
    userId: string,
    { page, pageSize }: GetGuildNotificationsDto,
  ): Promise<IGenericListPayloadResponse<WebhookNotificationEntity>> {
    const [items, count] = await this.webhookNotificationsRepository.findAndCount({
      where: { onwerId: userId },
      order: { createdAt: 'DESC' },
      relations: { guild: true, streamerEvent: { streamer: true } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, meta: { count } };
  }

  async getUserNotificationLogs(
    userId: string,
    { page, pageSize }: GetNotificationLogsDto,
  ): Promise<IGenericListPayloadResponse<IUserNotificationLogModel>> {
    const [logs, count] = await this.notificationLogsRepository.findAndCount({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: logs.map((log) => this.usersMapper.notificationLogToItem(log)),
      meta: { count },
    };
  }
}
