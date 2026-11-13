export interface IPublicStreamerModel {
  twitchLogin: string;
  displayName: string;
  profileImageUrl: string | null;
  isPartner: boolean;
  /** 1-based position in the showcase (by recent activity). */
  rank: number;
  /** The most active streamer of the activity window. Only set when they actually had deliveries. */
  isTopActive: boolean;
  /** Successful deliveries within the activity window. */
  notificationsDelivered: number;
  /** Distinct Discord servers that received this streamer's notifications within the window. */
  communitiesReached: number;
  lastNotifiedAt: string | null;
}
