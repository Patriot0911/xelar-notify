import { Injectable } from '@nestjs/common';
import { TwitchAppsRepository } from '../repositories';

@Injectable()
export class TwitchAppService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
  ) {}

  async releaseAppCost(clientId: string, cost: number) {
    await this.twitchAppsRepository.decrement(
      { clientId },
      'currentCost',
      cost,
    );
  }
}
