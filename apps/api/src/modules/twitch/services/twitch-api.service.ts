import { TwitchAppEntity } from '@libs/database';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class TwitchApiService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(TwitchAppEntity)
    private readonly twitchAppsRepository: Repository<TwitchAppEntity>,
  ) {}

  async getStream(userLogin: string) {
    const app = await this.getLeastLoadedApp();

    const { data } = await firstValueFrom(
      this.httpService.get('/helix/streams', {
        params: { user_login: userLogin },
        twitchClientId: app.clientId,
      } as any),
      // todo: add generic model for params
    );

    return data;
  }

  private async getLeastLoadedApp() {
    const app = await this.twitchAppsRepository
      .createQueryBuilder('app')
      .where('app.capacity < app.maxCapacity')
      .orderBy('app.capacity', 'ASC')
      .getOne();
    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }
    return app;
  }
}
