import { Injectable } from '@nestjs/common';
import { ITwitchTokenModel } from './models';
import { TwitchAppsRepository } from './repositories';

@Injectable()
export class TwitchTokenManager {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
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
      }, true);

      if (
        twitchApp
        && twitchApp.accessToken
        && twitchApp.tokenExpiresAt
        && Date.now() < twitchApp.tokenExpiresAt.getTime()
      ) {
        this.setToken(
          clientId,
          twitchApp.accessToken,
          twitchApp.tokenExpiresAt.getTime()
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
        this.twitchAppsRepository.updateToken(
          { clientId, },
          current.accessToken,
          new Date(current.expiresAt)
        );
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
