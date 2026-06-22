import { TwitchStreamerEvents } from '@libs/database';

export const AllowedTwitchEvents = [
  TwitchStreamerEvents.STREAM_ONLINE,
  TwitchStreamerEvents.CHANNEL_CHEER,
  TwitchStreamerEvents.CHANNEL_SUBSCRIBE,
];

export const privateTwitchEvents = [
  TwitchStreamerEvents.CHANNEL_CHEER,
  TwitchStreamerEvents.CHANNEL_RAID,
  TwitchStreamerEvents.CHANNEL_UPDATE,
  TwitchStreamerEvents.CHANNEL_SUBSCRIBE,
];
