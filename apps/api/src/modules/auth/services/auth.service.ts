import {
  IAccessTokenPayload,
  IAuthResponse,
  ILoginByEmailModel,
  IRefreshTokenPayload,
  IRegisterByEmailModel,
  ISessionModel,
  IUpdateProfileModel,
  TokenType,
} from '../models';
import { AccountStatus, Permission, UserEntity, UserSessionEntity } from '@libs/database/entities';
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
import { DiscordAuthService } from '../../discord/services';
import { RolesMapper } from '../../roles/mappers';
import { RolesService } from '../../roles/services';
import { accessTokenBlackList, RedisService } from '@libs/redis';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly discordAuthService: DiscordAuthService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
    private readonly rolesMapper: RolesMapper,
    private readonly rolesService: RolesService,
    private readonly redisService: RedisService,
    @Inject(authConfig.KEY)
    private authConfigService: ConfigType<typeof authConfig>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserSessionEntity)
    private sessionsRepository: Repository<UserSessionEntity>,
  ) {}

  async authByDiscordCode(code: string): Promise<IAuthResponse> {
    const { accessToken, } = await this.discordAuthService.exchangeCodeForTokens(code);
    const discordMe = await this.discordAuthService.getDiscordMeByToken(accessToken);

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
        userData.discordAccessToken = accessToken;
        await this.usersRepository.save(userData);
      }
    } else {
      const newUser = this.usersRepository.create({
        email: discordMe.email,
        displayName: discordMe.globalName,
        discordId: discordMe.id,
        discordAccessToken: accessToken,
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
    const discordMe = await this.discordAuthService.getDiscordMeByToken(accessToken);

    const conflicting = await this.usersRepository.findOne({
      where: { discordId: discordMe.id },
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
