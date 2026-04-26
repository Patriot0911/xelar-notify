import { ApiProperty } from '@nestjs/swagger';
import { IRegisterByEmailModel } from '../models';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegistrationByEmailDto implements IRegisterByEmailModel {
  @ApiProperty({ example: 'example_email@gmail.com', })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example_password', })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Example User Display Name', })
  @IsString()
  @MinLength(2)
  displayName: string;
}
