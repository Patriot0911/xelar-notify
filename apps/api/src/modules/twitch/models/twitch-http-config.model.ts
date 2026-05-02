import { AxiosRequestConfig } from 'axios';

export interface ITwitchHttpConfigModel extends AxiosRequestConfig<any> {
  twitchClientId: string;
};
