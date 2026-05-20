
export type TRabbitUser = 'api' | 'receiver' | 'discord' | 'worker';

export interface IRabbitConfigModel {
  host: string;
  port: number;
  user: string;
  password: string;

  users: {
    [key in TRabbitUser]: {
      user: string;
      password: string;
    };
  };
};
