import { IAuthenticatePayload } from '@libs/shared';
import { IsString } from 'class-validator';

export class AuthenticateDto implements IAuthenticatePayload {
  @IsString()
  discordId: string;
}
