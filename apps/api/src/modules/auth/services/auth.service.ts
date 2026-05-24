import { IAccessTokenPayload, IAuthResponse, ILoginByEmailModel, IRefreshTokenPayload, IRegisterByEmailModel, TokenType } from '../models';
import { Permission, UserEntity } from '@libs/database/entities';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly discordAuthService: DiscordAuthService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
    private readonly rolesMapper: RolesMapper,
    private readonly rolesService: RolesService,
    @Inject(authConfig.KEY)
    private authConfigService: ConfigType<typeof authConfig>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async authByDiscordCode(code: string): Promise<IAuthResponse> {
    const { accessToken, } = await this.discordAuthService.exchangeCodeForTokens(code);
    const discordMe = await this.discordAuthService.getDiscordMeByToken(accessToken);

    let userData = await this.usersRepository.findOne({
      where: [
        { email: discordMe.email, },
        { discordId: discordMe.id, },
      ],
      relations: {
        roles: true,
      },
    });

    if (!userData) {
      const newUser = this.usersRepository.create({
        email: discordMe.email,
        displayName: discordMe.globalName,
        discordId: discordMe.id,
        discordAccessToken: accessToken,
        roles: [],
      });
      userData = await this.usersRepository.save(newUser);
    } else {
      if (userData.discordId !== discordMe.id) {
        userData.discordId = discordMe.id;
        userData.discordAccessToken = accessToken;
        await this.usersRepository.save(userData);
      }
    }

    const { permissions, roles, } = await this.rolesService.getRolesAccessesForUser(userData.id);

    const tokens = await this.generateTokens(
      userData.id,
      permissions,
      roles,
    );
    await this.updateRefreshToken(userData.id, tokens.refreshToken);

    return this.authMapper.toAuthResponse(userData, tokens);
  }

  async loginByEmail(data: ILoginByEmailModel): Promise<IAuthResponse> {
    const userData = await this.usersRepository.findOne({
      where: {
        email: data.email,
        password: Not(IsNull()),
      },
      relations: {
        roles: true,
      },
    });

    if (!userData) {
      throw new BadRequestException('Invalid credentials');
    }

    const isValidPassword = await this.passwordService.verify(userData.password!, data.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const { permissions, roles, } = await this.rolesService.getRolesAccessesForUser(userData.id);

    const tokens = await this.generateTokens(
      userData.id,
      permissions,
      roles,
    );
    await this.updateRefreshToken(userData.id, tokens.refreshToken);
    return this.authMapper.toAuthResponse(userData, tokens);
  }

  async registerByEmail(data: IRegisterByEmailModel): Promise<IAuthResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: data.email, },
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

    const { permissions, roles, } = this.rolesMapper.rolesToAccess(createdUser.roles ?? []);

    const tokens = await this.generateTokens(
      createdUser.id,
      permissions,
      roles
    );
    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);
    return this.authMapper.toAuthResponse(createdUser, tokens);
  }

  async refreshToken(userId: string, refreshToken: string) {
    const userData = await this.usersRepository.findOne({
      where: { id: userId, },
      relations: {
        roles: true,
      },
    });

    if (!userData || !userData.refreshToken) {
      throw new UnauthorizedException();
    }

    const isValid = await this.passwordService.verify(userData.refreshToken, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    const { permissions, roles, } = await this.rolesService.getRolesAccessesForUser(userData.id);

    const tokens = await this.generateTokens(
      userId,
      permissions,
      roles,
    );
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return this.authMapper.toAuthResponse(userData, tokens);
  }

  async logout(userId: string): Promise<boolean> {
    const updatedUser = await this.usersRepository.update(
      { id: userId, },
      { refreshToken: null, }
    );
    return !!updatedUser.affected;
  }

  async generateTokens(
    userId: string,
    permissions: Permission[],
    roles: string[]
  ) {
    const accessPayload: IAccessTokenPayload = {
      use: TokenType.Access,
      sub: userId,
      permissions,
      roles,
    };
    const refreshPayload: IRefreshTokenPayload = {
      use: TokenType.Refresh,
      sub: userId,
    };
    const accessToken = await this.signTokenPayload(accessPayload, TokenType.Access);
    const refreshToken = await this.signTokenPayload(refreshPayload, TokenType.Refresh);
    return { accessToken, refreshToken };
  }

  async signTokenPayload(payload: IAccessTokenPayload | IRefreshTokenPayload, type: TokenType): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.authConfigService.jwt.ttl[type],
      secret: this.authConfigService.jwt.secret[type],
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await this.passwordService.hash(refreshToken);
    await this.usersRepository.update({ id: userId, }, { refreshToken: hashed, });
  }

  async verifyRefreshToken(userId: string, refreshToken: string) {
    const userData = await this.usersRepository.findOne({
      where: { id: userId, },
    });
    if (!userData || !userData?.refreshToken) return false;
    const isValidRefresh = await this.passwordService.verify(userData.refreshToken, refreshToken);
    return isValidRefresh;
  }
}
