import { Injectable } from '@nestjs/common';
import { ITwitchTokenModel } from './models';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchAppEntity } from '@libs/database';
import { Repository } from 'typeorm';

@Injectable()
export class TwitchTokenManager {
  constructor(
    @InjectRepository(TwitchAppEntity)
    private readonly twitchAppsRepository: Repository<TwitchAppEntity>,
  ) {}

  // Todo: replace with redis
  private readonly tokens = new Map<string, ITwitchTokenModel>();

  setToken(clientId: string, token: string, expiresIn: number) {
    const expiresAt = Date.now() + (expiresIn - 60) * 1000;
    this.tokens.set(clientId, {
      accessToken: token,
      expiresAt: expiresAt,
      refreshing: null,
    });
  }

  isExpired(clientId: string): boolean {
    const state = this.tokens.get(clientId);
    return !state || Date.now() >= state.expiresAt;
  }

  invalidate(clientId: string) {
    const state = this.tokens.get(clientId);
    if (state) {
      state.expiresAt = 0;
    }
  }

  // Note: creating a new token and refreshing an existing one
  async getOrRefresh(clientId: string, refreshFn: () => Promise<string>): Promise<string> {
    const state = this.tokens.get(clientId);

    if (!state) {
      // todo: move to sep method?
      const twitchApp = await this.twitchAppsRepository.findOne({
        where: { clientId, },
        select: {
          accessToken: true,
          tokenExpiresAt: true,
        }
      });

      if (
        twitchApp
        && twitchApp.accessToken
        && twitchApp.tokenExpiresAt
        && Date.now() < twitchApp.tokenExpiresAt
      ) {
        this.setToken(
          clientId,
          twitchApp.accessToken,
          twitchApp.tokenExpiresAt
        );
        return this.getOrRefresh(clientId, refreshFn);
      }
    }

    if (state && !this.isExpired(clientId)) {
      return state.accessToken;
    }

    if (state?.refreshing) {
      return state.refreshing;
    }

    const refreshing = refreshFn().finally(() => {
      const current = this.tokens.get(clientId);
      if (current) {
        this.twitchAppsRepository.update(
          { clientId, },
          {
            accessToken: current.accessToken,
            tokenExpiresAt: current.expiresAt,
          }
        )
        current.refreshing = null;
      }
    });

    if (state) {
      state.refreshing = refreshing;
    } else {
      this.tokens.set(clientId, {
        accessToken: '',
        expiresAt: 0,
        refreshing,
      });
    }

    return refreshing;
  }
}
