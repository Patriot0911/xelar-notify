import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ILoginByEmailModel } from '../models';

export class LoginByEmailDto implements ILoginByEmailModel {
  @ApiProperty({ example: 'example_email@gmail.com', })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example_password', })
  @IsString()
  @MinLength(8)
  password: string;
}
