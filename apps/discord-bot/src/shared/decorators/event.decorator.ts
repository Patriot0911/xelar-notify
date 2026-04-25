import { SetMetadata } from '@nestjs/common';

export const EVENT_METADATA = 'discord:event';

export const OnDiscordEvent = (event: string) =>
  SetMetadata(EVENT_METADATA, event);
