export interface IPublicStreamersStatsModel {
  /** Public (non-internal) streamers with at least one active Twitch subscription. */
  totalStreamers: number;
  /** Successful deliveries for public streamers, all time. */
  notificationsDelivered: number;
  /** Successful deliveries for public streamers within the activity window. */
  notificationsDeliveredRecent: number;
  /** Distinct Discord servers that ever received a notification for a public streamer. */
  communitiesReached: number;
}
