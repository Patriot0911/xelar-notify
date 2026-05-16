import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { API_RPC_CLIENT } from './rpc.constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { TRpcCallResultModel } from './rpc-call-result.model';
import { IErrorResponse } from '@libs/shared';

@Injectable()
export class RpcService implements OnModuleDestroy {
  constructor(
    @Inject(API_RPC_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  async onModuleDestroy() {
    await this.client.close();
  }

  async call<TResult, TInput = unknown>(
    pattern: string,
    data: TInput,
    timeoutMs = 8000,
  ): Promise<TResult> {
    const response: any = await firstValueFrom(
      this.client
        .send(pattern, data)
        .pipe(timeout(timeoutMs)),
    );
    if (!response?.status) {
      throw response;
    }
    return response;
  }

  async callSafe<TResult, TInput = unknown, TErrorData = unknown>(
    pattern: string,
    data: TInput,
    timeoutMs = 8000,
  ): Promise<TRpcCallResultModel<TResult, TErrorData>> {
    try {
      const result = await this.call<TResult, TInput>(pattern, data, timeoutMs);
      return { status: true, data: result };
    } catch (e) {
      return { status: false, error: e as IErrorResponse<TErrorData> };
    }
  }
}
