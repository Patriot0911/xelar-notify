export interface ITwitchTokenResponseModel {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export interface ITwitchUserTokenResponseModel extends ITwitchTokenResponseModel {
  refresh_token: string;
  scope: string[];
};

export interface ITwitchUserTokensModel {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
