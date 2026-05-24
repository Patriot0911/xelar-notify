import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserPayload } from '../models';
import { AuthMapper } from '../mappers';
import { UserEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildService } from '../../discord/services';

@Injectable()
export class MeService {
  constructor(
    private readonly authMapper: AuthMapper,
    private readonly discordGuildService: DiscordGuildService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getMe(userId: string): Promise<IUserPayload> {
    const userData = await this.usersRepository.findOneOrFail({
      where: { id: userId, },
      relations: { roles: true, },
    });
    if (!userData) {
      throw new UnauthorizedException();
    }
    return this.authMapper.toUserPayload(userData);
  }

  async getUserDiscordGuilds(userId: string, limit: number = 20, beginWithGuildId?: string): Promise<any> {
    const discordGuilds = await this.discordGuildService.getDiscordUserGuilds(userId, limit, false, beginWithGuildId);
    return discordGuilds;
  }
}
