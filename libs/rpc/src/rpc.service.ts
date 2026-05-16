import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { API_RPC_CLIENT } from './rpc.constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

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
    return firstValueFrom(
      this.client
        .send<TResult>(pattern, data)
        .pipe(timeout(timeoutMs)),
    );
  }
}
