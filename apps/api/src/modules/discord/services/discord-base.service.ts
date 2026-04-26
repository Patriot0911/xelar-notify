import { UserEntity } from '@libs/database';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DiscordBaseService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getUserDiscordAccessToken(userId: string): Promise<string> {
    const userData = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: { discordAccessToken: true, },
    });

    if (!userData || !userData.discordAccessToken) {
      throw new BadRequestException('User not found or not authenticated with Discord');
    }

    return userData.discordAccessToken;
  }

  getRequestHeadersWithDiscordToken(discordAccessToken: string) {
    return {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${discordAccessToken}`,
      },
    };
  }
}
