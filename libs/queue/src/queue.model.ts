export interface IQueueCredentials {
  user:     string;
  password: string;
};

export interface IQueueOptions {
  inject:     any[];
  useFactory: (...args: any[]) => IQueueCredentials;
};
