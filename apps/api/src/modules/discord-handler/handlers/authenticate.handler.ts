import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { UserEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuthenticateResult } from '@libs/shared';
import { RpcPayload } from '@libs/rpc';
import { DiscordAuthService } from '../../discord/services';
import { AuthenticateDto } from '../dto';

@Controller()
export class AuthenticateHandler {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly discordAuthService: DiscordAuthService,
  ) {}

  @MessagePattern(RpcPatterns.discord.authenticate)
  async handle(@RpcPayload() data: AuthenticateDto): Promise<IAuthenticateResult> {
    const user = await this.usersRepository.findOne({
      where: { discordId: data.discordId },
    });

    if (user) {
      return { isRegistered: true };
    }

    const authUrl = this.discordAuthService.getDiscordAuthRedirectUri();
    return { isRegistered: false, authUrl };
  }
}
