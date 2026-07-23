export interface IStreamerListItemModel {
  id: string;
  broadcasterId: string;
  twitchLogin: string;
  displayName: string;
  profileImageUrl: string | null;
  isPartner: boolean;
  isInternal: boolean;
  allowPersonalSubscriptions: boolean;
  linkedUserId: string | null;
  createdAt: Date;
};
