export type TTwitchUserType =
  'admin' // Twitch administrator
  | 'global_mod'
  | 'staff' // Twitch staff
  | ''; // Normal user

export type TTwitchBroadcasterType =
  'affiliate' // affiliate broadcaster
  | 'partner' // partner broadcaster
  | ''; // normal broadcaster

export interface ITwitchApiUserModel {
  id: string;
  login: string;
  display_name: string;
  type: TTwitchUserType;
  broadcaster_type: string;
  description: string;
  profile_image_url?: string | null;
  offline_image_url?: string | null;
  view_count: number;
  email: string;
  created_at: string;
};

export interface ITwitchApiUserNormalizedModel {
  broadcasterId: string;
  login: string;
  displayName: string;
  type: TTwitchUserType;
  broadcasterType: string;
  description: string;
  profileImageUrl?: string | null;
  offlineImageUrl?: string | null;
  viewCount: number;
  email: string;
  createdAt: Date;
};
