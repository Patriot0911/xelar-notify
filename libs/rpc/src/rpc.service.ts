import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { API_RPC_CLIENT } from './rpc.constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { IErrorResponse, RpcError, TRpcCallResultModel } from '@libs/shared';

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
    return response;
  }

  async callSafe<TResult, TInput = unknown, TErrorData = Record<string, unknown>>(
    pattern: string,
    data: TInput,
    timeoutMs = 8000,
  ): Promise<TRpcCallResultModel<TResult, TErrorData>> {
    try {
      const result = await this.call<TResult, TInput>(pattern, data, timeoutMs);
      return {
        status: true,
        data: result,
      };
    } catch (e) {
      const errorResponse = <IErrorResponse<TErrorData>> e;
      return errorResponse;
    }
  }
}
