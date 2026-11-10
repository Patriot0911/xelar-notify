export enum NotificationPrice {
  FREE = 0,
  STANDARD = 1,
};

/**
 * Columns `?search=` matches on notification lists (aliases: `event` = streamer event, `streamer`).
 * Shared by guild, "my" and admin user lists so search behaves the same everywhere.
 */
export const NOTIFICATION_SEARCH_COLUMNS = [
  'streamer.displayName',
  'streamer.twitchLogin',
  'CAST(event.event AS text)',
];
