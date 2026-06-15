import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosError } from 'axios';
import { TwitchAppAuthService, TwitchUserTokenService } from './services';
import { ITwitchHttpConfigModel } from './models';

@Injectable()
export class TwitchAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly twitchAuthService: TwitchAppAuthService,
    private readonly twitchUserTokenService: TwitchUserTokenService,
  ) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }

  createAxiosInterceptors(httpService: HttpService) {
    const axios = httpService.axiosRef;

    axios.interceptors.request.use(async (config: any) => {
      const { twitchClientId: clientId, accessToken } = <ITwitchHttpConfigModel> config;
      if (!clientId) {
        return config;
      }

      const token = accessToken ?? await this.twitchAuthService.getTokenForApp(clientId);
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['Client-Id'] = clientId;
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (
          error.response?.status === 401
          && !originalRequest._retry
          && !originalRequest.accessToken
        ) {
          originalRequest._retry = true;

          const clientId = originalRequest.twitchClientId;
          const token = await this.twitchAuthService.getTokenForApp(clientId, true);
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          return axios(originalRequest);
        }

        if (
          error.response?.status === 401
          && !originalRequest._retry
          && originalRequest.accessToken
          && originalRequest.twitchUserId
        ) {
          originalRequest._retry = true;

          try {
            const token = await this.twitchUserTokenService.forceRefresh(originalRequest.twitchUserId);
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            originalRequest.accessToken = token;

            return axios(originalRequest);
          } catch {
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      },
    );
  }
}
