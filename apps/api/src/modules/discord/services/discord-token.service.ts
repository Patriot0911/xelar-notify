import { UserEntity } from '@libs/database';
import { DiscordNotConnectedException, DiscordTokenRevokedException } from '../../auth/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from '@libs/shared';
import { DiscordAuthService } from './discord-auth.service';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordTokenService {
  constructor(
    private readonly crypto: CryptoService,
    private readonly discordAuthService: DiscordAuthService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getValidToken(userId: string): Promise<string> {
    const user = await this.getUserWithTokens(userId);

    if (!this.isExpired(user.discordTokenExpiresAt!)) {
      return this.crypto.decrypt(user.discordAccessToken!);
    }

    return this.refresh(userId, user.discordRefreshToken!);
  }

  async validateConnection(userId: string): Promise<void> {
    const user = await this.getUserWithTokens(userId);

    if (this.isExpired(user.discordTokenExpiresAt!)) {
      await this.refresh(userId, user.discordRefreshToken!);
    }
  }

  async refresh(userId: string, encryptedRefreshToken: string): Promise<string> {
    const refreshToken = this.crypto.decrypt(encryptedRefreshToken);

    try {
      const data = await this.discordAuthService.refreshToken(refreshToken);

      await this.usersRepository.update(
        { id: userId },
        {
          discordAccessToken: this.crypto.encrypt(data.accessToken),
          discordRefreshToken: this.crypto.encrypt(data.refreshToken),
          discordTokenExpiresAt: new Date(Date.now() + data.expiresIn * 1000),
        },
      );

      return data.accessToken;
    } catch {
      await this.usersRepository.update(
        { id: userId },
        {
          discordAccessToken: null,
          discordRefreshToken: null,
          discordTokenExpiresAt: null,
        },
      );
      throw new DiscordTokenRevokedException();
    }
  }

  isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true;
    return new Date() >= new Date(expiresAt.getTime() - 5 * 60 * 1000);
  }

  private async getUserWithTokens(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        discordId: true,
        discordAccessToken: true,
        discordRefreshToken: true,
        discordTokenExpiresAt: true,
      },
    });

    if (
      !user?.discordId
      || !user.discordAccessToken
      || !user.discordRefreshToken
      || !user.discordTokenExpiresAt
    ) {
      throw new DiscordNotConnectedException();
    }

    return user;
  }
}
