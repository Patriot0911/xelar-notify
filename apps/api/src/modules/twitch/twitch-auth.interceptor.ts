import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosError } from 'axios';
import { TwitchAuthService } from './services';
import { ITwitchHttpConfigModel } from './models';

@Injectable()
export class TwitchAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly twitchAuthService: TwitchAuthService,
  ) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }

  createAxiosInterceptors(httpService: HttpService) {
    const axios = httpService.axiosRef;

    axios.interceptors.request.use(async (config: any) => {
      const clientId = (<ITwitchHttpConfigModel> config).twitchClientId;
      if (!clientId) {
        return config;
      }

      const token = await this.twitchAuthService.getTokenForApp(clientId);
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['Client-Id'] = clientId;
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const clientId = originalRequest.twitchClientId;
          const token = await this.twitchAuthService.getTokenForApp(clientId, true);
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          return axios(originalRequest);
        }

        return Promise.reject(error);
      },
    );
  }
}
