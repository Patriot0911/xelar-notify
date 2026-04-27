export interface ITwitchTokenModel {
  accessToken: string;
  expiresAt: number;
  refreshing: Promise<string> | null;
};
