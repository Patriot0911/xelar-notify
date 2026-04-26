import { IAccessTokenPayload, IAuthResponse, ILoginByEmailModel, IRefreshTokenPayload, IRegisterByEmailModel, IUserPayload, TokenType } from '../models';
import { UserEntity } from '@libs/database/entities';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { AuthMapper } from '../mappers';
import { authConfig } from '@libs/config';
import { DiscordAuthService } from '../../discord';

@Injectable()
export class AuthService {
  constructor(
    private readonly discordAuthService: DiscordAuthService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
    @Inject(authConfig.KEY)
    private authConfigService: ConfigType<typeof authConfig>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async authByDiscordCode(code: string): Promise<IAuthResponse> {
    const { access_token, } = await this.discordAuthService.exchangeCodeForTokens(code);
    const discordMe = await this.discordAuthService.getDiscordMe(access_token);

    let userData = await this.usersRepository.findOne({
      where: [
        { email: discordMe.email, },
        { discordId: discordMe.id, },
      ],
    });

    if (!userData) {
      const newUser = this.usersRepository.create({
        email: discordMe.email,
        displayName: discordMe.globalName,
        discordId: discordMe.id,
        discordAccessToken: access_token,
      });
      userData = await this.usersRepository.save(newUser);
    } else {
      if (userData.discordId !== discordMe.id) {
        userData.discordId = discordMe.id;
        userData.discordAccessToken = access_token;
        await this.usersRepository.save(userData);
      }
    }

    const tokens = await this.generateTokens(
      userData.id,
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
    });

    if (!userData) {
      throw new BadRequestException('Invalid credentials');
    }

    const isValidPassword = await this.passwordService.verify(userData.password!, data.password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      userData.id,
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
    });
    const createdUser = await this.usersRepository.save(newUser);
    const tokens = await this.generateTokens(
      createdUser.id,
    );
    await this.updateRefreshToken(createdUser.id, tokens.refreshToken);
    return this.authMapper.toAuthResponse(createdUser, tokens);
  }

  async getMe(userId: string): Promise<IUserPayload> {
    const userData = await this.usersRepository.findOneOrFail({
      where: { id: userId, },
    });
    if (!userData) {
      throw new UnauthorizedException();
    }
    return this.authMapper.toMeDto(userData);
  }

  async refreshToken(userId: string, refreshToken: string) {
    const userData = await this.usersRepository.findOne({
      where: { id: userId, }
    });

    if (!userData || !userData.refreshToken) {
      throw new UnauthorizedException();
    }

    const isValid = await this.passwordService.verify(userData.refreshToken, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(
      userId,
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

  async generateTokens(userId: string) { // todo: roles / permissions
    const accessPayload: IAccessTokenPayload = {
      use: TokenType.Access,
      sub: userId,
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
  };
}
