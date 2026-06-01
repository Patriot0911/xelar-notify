import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IUpdateProfileModel, IUserPayload } from '../models';
import { AuthMapper } from '../mappers';
import { UserEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordService } from './password.service';

@Injectable()
export class MeService {
  constructor(
    private readonly authMapper: AuthMapper,
    private readonly passwordService: PasswordService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getMe(userId: string): Promise<IUserPayload> {
    const userData = await this.usersRepository.findOneOrFail({
      where: { id: userId, },
      relations: { roles: true, },
    });
    if (!userData) {
      throw new UnauthorizedException();
    }
    return this.authMapper.toUserPayload(userData);
  }

  async updateProfile(userId: string, data: IUpdateProfileModel): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.displayName) {
      user.displayName = data.displayName;
    }

    if (data.newPassword) {
      if (user.password) {
        if (!data.oldPassword) {
          throw new BadRequestException('Old password is required');
        }
        const isValidOld = await this.passwordService.verify(user.password, data.oldPassword);
        if (!isValidOld) {
          throw new BadRequestException('Invalid old password');
        }
      }
      user.password = await this.passwordService.hash(data.newPassword);
    }

    await this.usersRepository.save(user);
  }
}
