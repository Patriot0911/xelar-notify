import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DiscordTokenService } from '../services';
import { DiscordTokenRevokedException } from '../../auth/exceptions';

@Injectable()
export class DiscordGuard implements CanActivate {
  constructor(
    private readonly discordTokenService: DiscordTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId  = request.user.sub;

    if (!userId) {
      throw new DiscordTokenRevokedException();
    }

    await this.discordTokenService.validateConnection(userId);

    return true;
  }
}
