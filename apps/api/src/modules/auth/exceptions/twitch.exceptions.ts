import { HttpException, HttpStatus } from '@nestjs/common';

export class TwitchNotConnectedException extends HttpException {
  constructor() {
    super(
      { data: 'TWITCH_NOT_CONNECTED', message: 'Twitch account not connected' },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class TwitchTokenRevokedException extends HttpException {
  constructor() {
    super(
      { data: 'TWITCH_TOKEN_REVOKED', message: 'Twitch access was revoked, please reconnect' },
      HttpStatus.FORBIDDEN,
    );
  }
}
