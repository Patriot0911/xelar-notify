import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TwitchAppEntity } from '@libs/database';
import { ITwitchAppEncryptOptionsModel } from '../models';
import { CryptoService } from '@libs/shared';

const defaultEncryptOptions: ITwitchAppEncryptOptionsModel = {
  accessToken: true,
  clientSecret: true,
  webhookSecret: true,
};

@Injectable()
export class TwitchAppsRepository extends Repository<TwitchAppEntity> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly crypto: CryptoService,
  ) {
    super(TwitchAppEntity, dataSource.createEntityManager());
  }

  async saveApp(
    app: Partial<TwitchAppEntity>,
  ): Promise<TwitchAppEntity> {
    const encrypted = this.encryptFields(app);
    const saved = await super.save(encrypted as TwitchAppEntity);
    return this.decryptFields(saved);
  }

  override async findOne(
    options: Parameters<Repository<TwitchAppEntity>['findOne']>[0],
    shouldDecrypt = false,
    decryptOptions: ITwitchAppEncryptOptionsModel = defaultEncryptOptions
  ): Promise<TwitchAppEntity | null> {
    const app = await super.findOne(options);
    if (!app) {
      return null;
    }
    return shouldDecrypt
      ? this.decryptFields(app, decryptOptions)
      : app;
  }

  override async find(
    options?: Parameters<Repository<TwitchAppEntity>['find']>[0],
    shouldDecrypt = false,
  ): Promise<TwitchAppEntity[]> {
    const apps = await super.find(options);
    return shouldDecrypt
      ? apps.map((app) => this.decryptFields(app))
      : apps;
  }

  async updateApp(
    options: FindOptionsWhere<TwitchAppEntity>,
    dto: Partial<TwitchAppEntity>,
  ): Promise<void> {
    const encrypted = this.encryptFields(dto);
    await super.update(options, encrypted);
  }

  async updateToken(
    options: FindOptionsWhere<TwitchAppEntity>,
    accessToken: string,
    tokenExpiresAt: Date,
  ): Promise<void> {
    await super.update(options, {
      accessToken: this.crypto.encrypt(accessToken),
      tokenExpiresAt,
    });
  }

  async findLeastLoaded(
    shouldDecrypt = false,
    decryptOptions: ITwitchAppEncryptOptionsModel = defaultEncryptOptions,
  ): Promise<TwitchAppEntity | null> {
    const app = await this
      .createQueryBuilder('app')
      .where('app.currentCost < app.maxCost')
      .orderBy('app.currentCost', 'ASC')
      .getOne();
    return (app && shouldDecrypt)
      ? this.decryptFields(app, decryptOptions)
      : app;
  }

  private encryptFields(app: Partial<TwitchAppEntity>): Partial<TwitchAppEntity> {
    return {
      ...app,
      clientSecret: app.clientSecret
        ? this.crypto.encrypt(app.clientSecret)
        : app.clientSecret,
      accessToken: app.accessToken
        ? this.crypto.encrypt(app.accessToken)
        : app.accessToken,
      webhookSecret: app.webhookSecret
        ? this.crypto.encrypt(app.webhookSecret)
        : app.webhookSecret,
    };
  }

  private decryptFields(app: TwitchAppEntity, options: ITwitchAppEncryptOptionsModel = defaultEncryptOptions): TwitchAppEntity {
    return {
      ...app,
      clientSecret: (app.clientSecret && options.clientSecret)
        ? this.crypto.decrypt(app.clientSecret)
        : app.clientSecret,
      accessToken: (app.accessToken && options.accessToken)
        ? this.crypto.decrypt(app.accessToken)
        : app.accessToken,
      webhookSecret: (app.webhookSecret && options.webhookSecret)
        ? this.crypto.decrypt(app.webhookSecret)
        : app.webhookSecret,
    };
  }
}
