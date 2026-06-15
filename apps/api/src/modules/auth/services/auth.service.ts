import {
  IAccessTokenPayload,
  IAuthResponse,
  ILoginByEmailModel,
  IRefreshTokenPayload,
  IRegisterByEmailModel,
  ISessionModel,
  TokenType,
} from '../models';
import { AccountStatus, Permission, TwitchStreamerEntity, UserEntity, UserSessionEntity } from '@libs/database/entities';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { AuthMapper } from '../mappers';
import { authConfig } from '@libs/config';
import { DiscordApiService, DiscordAuthService, DiscordTokenService } from '../../discord/services';
import { RolesMapper } from '../../roles/mappers';
import { RolesService } from '../../roles/services';
import { accessTokenBlackList, RedisService } from '@libs/redis';
import { randomUUID } from 'crypto';
import { CryptoService } from '@libs/shared';
import { TwitchApiService, TwitchUserAuthService } from '../../twitch/services';
import { TwitchSubscriptionService } from '../../twitch-subscriptions/services';

export const BASE_BALANCE = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly discordAuthService: DiscordAuthService,
    private readonly discordApiService: DiscordApiService,
    private readonly discordTokenService: DiscordTokenService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
    private readonly rolesMapper: RolesMapper,
    private readonly rolesService: RolesService,
    private readonly redisService: RedisService,
    @Inject(authConfig.KEY)
    private authConfigService: ConfigType<typeof authConfig>,
    private readonly crypto: CryptoService,
    private readonly twitchUserAuthService: TwitchUserAuthService,
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserSessionEntity)
    private sessionsRepository: Repository<UserSessionEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private twitchStreamersRepository: Repository<TwitchStreamerEntity>,
  ) {}

  async authByDiscordCode(code: string): Promise<IAuthResponse> {
    const { accessToken, expiresIn, refreshToken, } = await this.discordAuthService.exchangeCodeForTokens(code);
    const discordMe = await this.discordApiService.fetchMeUserByToken(accessToken);

    let userData = await this.usersRepository.findOne({
      where: [
        { email: discordMe.email },
        { discordId: discordMe.id },
      ],
      relations: { roles: true },
    });

    if (userData) {
      if (userData.status === AccountStatus.BLOCKED) {
        throw new ForbiddenException('Account is blocked');
      }
      if (userData.discordId !== discordMe.id) {
        userData.discordId = discordMe.id;
      }
      userData.discordAccessToken = accessToken;
      userData.discordRefreshToken = refreshToken;
      userData.discordTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
      await this.usersRepository.save(userData);
    } else {
      const newUser = this.usersRepository.create({
        email: discordMe.email,
        displayName: discordMe.globalName,
        discordId: discordMe.id,
        discordAccessToken: accessToken,
        balance: BASE_BALANCE,
        discordRefreshToken: refreshToken,
        discordTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        roles: [],
      });
      userData = await this.usersRepository.save(newUser);
    }

    const { permissions, roles, } = await this.rolesService.getRolesAccessesForUser(userData.id);
    return this.createSession(userData, permissions, roles);
  }

  async loginByEmail(data: ILoginByEmailModel): Promise<IAuthResponse> {
    const userData = await this.usersRepository.findOne({
      where: { email: data.email, password: Not(IsNull()) },
      relations: { roles: true },
    });

    if (!userData) {
      throw new BadRequestException('Invalid credentials');
    }

    if (userData.status === AccountStatus.BLOCKED) {
      throw new ForbiddenException('Account is blocked');
    }

    const isValidPassword = await this.passwordService.verify(userData.password!, data.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const { permissions, roles } = await this.rolesService.getRolesAccessesForUser(userData.id);
    return this.createSession(userData, permissions, roles);
  }

  async registerByEmail(data: IRegisterByEmailModel): Promise<IAuthResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }
    const hashedPassword = await this.passwordService.hash(data.password);
    const newUser = this.usersRepository.create({
      email: data.email,
      displayName: data.displayName,
      password: hashedPassword,
      balance: BASE_BALANCE,
      roles: [],
    });
    const createdUser = await this.usersRepository.save(newUser);
    const { permissions, roles } = this.rolesMapper.rolesToAccess(createdUser.roles ?? []);
    return this.createSession(createdUser, permissions, roles);
  }

  async refreshToken(userId: string, sessionId: string, rawRefreshToken: string): Promise<IAuthResponse> {
    const userData = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    if (!userData) {
      throw new UnauthorizedException();
    }

    if (userData.status === AccountStatus.BLOCKED) {
      throw new ForbiddenException('Account is blocked');
    }

    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId, userId, },
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    const { permissions, roles } = await this.rolesService.getRolesAccessesForUser(userData.id);

    const tokens = await this.generateTokens(userId, permissions, roles, sessionId);
    const hashedRefresh = await this.passwordService.hash(tokens.refreshToken);
    await this.sessionsRepository.update({ id: sessionId }, { refreshTokenHash: hashedRefresh });

    return this.authMapper.toAuthResponse(userData, tokens);
  }

  async refreshDiscordToken(userId: string): Promise<boolean> {
    await this.discordTokenService.validateConnection(userId);
    return true;
  }

  async logout(userId: string, sessionId: string, accessJti: string, accessExp: number): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      return false;
    }

    await this.sessionsRepository.delete({ id: sessionId });
    await this.blacklistAccessToken(accessJti, accessExp);
    return true;
  }

  async getSessions(userId: string): Promise<ISessionModel[]> {
    const sessions = await this.sessionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return sessions.map(this.authMapper.toSessionDto);
  }

  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.sessionsRepository.delete({ id: sessionId });
    return true;
  }

  async linkDiscord(userId: string, code: string): Promise<void> {
    const { accessToken } = await this.discordAuthService.exchangeCodeForTokens(code);
    const discordMe = await this.discordApiService.fetchMeUserByToken(accessToken);

    const conflicting = await this.usersRepository.findOne({
      where: [
        { discordId: discordMe.id },
        { email: discordMe.email },
      ],
    });
    if (conflicting && conflicting.id !== userId) {
      // todo: notify admin
      throw new BadRequestException('This Discord account is already linked to another user');
    }

    await this.usersRepository.update(
      { id: userId },
      { discordId: discordMe.id, discordAccessToken: accessToken },
    );
  }

  async unlinkDiscord(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.discordId) {
      throw new BadRequestException('No Discord account linked');
    }
    if (!user.password) {
      throw new BadRequestException('Cannot unlink Discord: no password set. Set a password first.');
    }
    await this.usersRepository.update(
      { id: userId },
      { discordId: null, discordAccessToken: null, discordRefreshToken: null },
    );
  }

  async linkTwitch(userId: string, code: string): Promise<void> {
    const tokens = await this.twitchUserAuthService.exchangeCodeForTokens(code);
    const internalApp = await this.twitchUserAuthService.getInternalApp();
    const twitchMe = await this.twitchApiService.getUserByToken(tokens.accessToken, internalApp.clientId);

    if (!twitchMe) {
      throw new BadRequestException('Could not fetch Twitch account information');
    }

    let twitchStreamer = await this.twitchStreamersRepository.findOne({
      where: { broadcasterId: twitchMe.broadcasterId },
    });

    if (twitchStreamer?.userId && twitchStreamer.userId !== userId) {
      // todo: notify admin
      throw new BadRequestException('This Twitch account is already linked to another user');
    }

    if (!twitchStreamer) {
      twitchStreamer = this.twitchStreamersRepository.create({
        broadcasterId: twitchMe.broadcasterId,
        twitchLogin: twitchMe.login,
        displayName: twitchMe.displayName,
        profileImageUrl: twitchMe.profileImageUrl,
        profileImageUpdatedAt: new Date(),
      });
    }

    twitchStreamer.userId = userId;
    twitchStreamer.allowPersonalSubscriptions = true;
    await this.twitchStreamersRepository.save(twitchStreamer);

    await this.usersRepository.update(
      { id: userId },
      {
        twitchAccessToken: this.crypto.encrypt(tokens.accessToken),
        twitchRefreshToken: this.crypto.encrypt(tokens.refreshToken),
        twitchTokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    );

    await this.twitchSubscriptionService.migrateToUserAuthorizedSubscriptions(twitchStreamer.id, userId);
  }

  async unlinkTwitch(userId: string): Promise<void> {
    const twitchStreamer = await this.twitchStreamersRepository.findOne({
      where: { userId },
    });

    if (!twitchStreamer) {
      throw new BadRequestException('No Twitch account linked');
    }

    await this.twitchSubscriptionService.downgradeUserAuthorizedSubscriptions(twitchStreamer.id);

    await this.twitchStreamersRepository.update(
      { id: twitchStreamer.id },
      { userId: null },
    );

    await this.usersRepository.update(
      { id: userId },
      {
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiresAt: null,
      },
    );
  }

  async setTwitchPersonalAuth(userId: string, enabled: boolean): Promise<void> {
    const twitchStreamer = await this.twitchStreamersRepository.findOne({
      where: { userId },
    });

    if (!twitchStreamer) {
      throw new BadRequestException('No Twitch account linked');
    }

    if (twitchStreamer.allowPersonalSubscriptions === enabled) {
      return;
    }

    await this.twitchStreamersRepository.update(
      { id: twitchStreamer.id },
      { allowPersonalSubscriptions: enabled },
    );

    if (enabled) {
      await this.twitchSubscriptionService.migrateToUserAuthorizedSubscriptions(twitchStreamer.id, userId);
    } else {
      await this.twitchSubscriptionService.downgradeUserAuthorizedSubscriptions(twitchStreamer.id);
    }
  }

  async verifyRefreshToken(sessionId: string, rawToken: string): Promise<boolean> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) return false;
    if (session.expiresAt < new Date()) return false;
    return this.passwordService.verify(session.refreshTokenHash, rawToken);
  }

  private async createSession(
    userData: UserEntity,
    permissions: Permission[],
    roles: string[],
  ): Promise<IAuthResponse> {
    const sessionId = randomUUID();
    const tokens = await this.generateTokens(userData.id, permissions, roles, sessionId);

    const expiresAt = new Date(
      Date.now() + this.authConfigService.jwt.ttl[TokenType.Refresh] * 1000,
    );
    const refreshTokenHash = await this.passwordService.hash(tokens.refreshToken);

    const session = this.sessionsRepository.create({
      id: sessionId,
      userId: userData.id,
      refreshTokenHash,
      expiresAt,
    });
    await this.sessionsRepository.save(session);

    return this.authMapper.toAuthResponse(userData, tokens);
  }

  async generateTokens(
    userId: string,
    permissions: Permission[],
    roles: string[],
    sessionId: string,
  ) {
    const jti = randomUUID();
    const accessPayload: IAccessTokenPayload = {
      use: TokenType.Access,
      sub: userId,
      jti,
      sessionId,
      permissions,
      roles,
    };
    const refreshPayload: IRefreshTokenPayload = {
      use: TokenType.Refresh,
      sub: userId,
      sessionId,
    };
    const accessToken = await this.signTokenPayload(accessPayload, TokenType.Access);
    const refreshToken = await this.signTokenPayload(refreshPayload, TokenType.Refresh);
    return { accessToken, refreshToken };
  }

  async signTokenPayload(
    payload: IAccessTokenPayload | IRefreshTokenPayload,
    type: TokenType,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.authConfigService.jwt.ttl[type],
      secret: this.authConfigService.jwt.secret[type],
    });
  }

  private async blacklistAccessToken(jti: string, accessExp: number): Promise<void> {
    const ttlSeconds = Math.max(0, accessExp - Math.floor(Date.now() / 1000));
    if (ttlSeconds > 0) {
      await this.redisService.set(accessTokenBlackList(jti), 1, ttlSeconds);
    }
  }
}
