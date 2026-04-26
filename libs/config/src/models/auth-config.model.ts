export interface IAuthConfigModel {
  jwt: {
    secret: {
      access: string;
      refresh: string;
    };
    ttl: {
      access: number;
      refresh: number;
    };
  };
};
