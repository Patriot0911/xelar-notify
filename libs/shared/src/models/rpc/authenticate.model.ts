export interface IAuthenticatePayload {
  discordId: string;
};

export interface IAuthenticateResult {
  isRegistered: boolean;
  authUrl?: string;
};
