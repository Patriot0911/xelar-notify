import { HttpException, HttpStatus } from '@nestjs/common';

export class DiscordNotConnectedException extends HttpException {
  constructor() {
    super(
      { data: 'DISCORD_NOT_CONNECTED', message: 'Discord account not connected' },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class DiscordTokenRevokedException extends HttpException {
  constructor() {
    super(
      { data: 'DISCORD_TOKEN_REVOKED', message: 'Discord access was revoked, please reconnect' },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
