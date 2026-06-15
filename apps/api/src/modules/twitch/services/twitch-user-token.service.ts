import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchStreamerEntity, UserEntity } from '@libs/database';
import { CryptoService } from '@libs/shared';
import { TwitchNotConnectedException, TwitchTokenRevokedException } from '../../auth/exceptions';
import { TwitchUserAuthService } from './twitch-user-auth.service';

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

@Injectable()
export class TwitchUserTokenService {
  constructor(
    private readonly crypto: CryptoService,
    private readonly twitchUserAuthService: TwitchUserAuthService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private readonly twitchStreamersRepository: Repository<TwitchStreamerEntity>,
  ) {}

  async getValidToken(userId: string): Promise<string> {
    const user = await this.getUserWithTokens(userId);

    if (!this.isExpired(user.twitchTokenExpiresAt!)) {
      return this.crypto.decrypt(user.twitchAccessToken!);
    }

    return this.refresh(userId, user.twitchRefreshToken!);
  }

  async forceRefresh(userId: string): Promise<string> {
    const user = await this.getUserWithTokens(userId);
    return this.refresh(userId, user.twitchRefreshToken!);
  }

  async refresh(userId: string, encryptedRefreshToken: string): Promise<string> {
    const refreshToken = this.crypto.decrypt(encryptedRefreshToken);

    try {
      const tokens = await this.twitchUserAuthService.refreshUserToken(refreshToken);

      await this.usersRepository.update(
        { id: userId },
        {
          twitchAccessToken: this.crypto.encrypt(tokens.accessToken),
          twitchRefreshToken: this.crypto.encrypt(tokens.refreshToken),
          twitchTokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        },
      );

      return tokens.accessToken;
    } catch (e) {
      if (e instanceof TwitchTokenRevokedException) {
        await this.clearTokens(userId);
      }
      throw e;
    }
  }

  async clearTokens(userId: string): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      {
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiresAt: null,
      },
    );

    await this.twitchStreamersRepository.update(
      { userId },
      { allowPersonalSubscriptions: false },
    );
  }

  isExpired(expiresAt: Date | null | string): boolean {
    if (!expiresAt) return true;
    const expireDate = new Date(expiresAt);
    return new Date() >= new Date(expireDate.getTime() - REFRESH_BUFFER_MS);
  }

  private async getUserWithTokens(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        twitchAccessToken: true,
        twitchRefreshToken: true,
        twitchTokenExpiresAt: true,
      },
    });

    if (
      !user?.twitchAccessToken
      || !user.twitchRefreshToken
      || !user.twitchTokenExpiresAt
    ) {
      throw new TwitchNotConnectedException();
    }

    return user;
  }
}
