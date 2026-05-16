import { Module, Global, DynamicModule } from '@nestjs/common';
import { RpcService } from './rpc.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';
import { ClientsModule, TcpClientOptions, Transport } from '@nestjs/microservices';
import { API_RPC_CLIENT } from './rpc.constants';

@Global()
@Module({})
export class RpcModule {
  static forRootAsync(options: {
    inject:     any[];
    useFactory: (...args: any[]) => { host: string; port: number };
  }): DynamicModule {
    return {
      module: RpcModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name:    API_RPC_CLIENT,
            inject:  [ConfigService, ...options.inject],
            useFactory: (_: ConfigService<AppConfig>, ...args: any[]): TcpClientOptions => ({
              transport: Transport.TCP,
              options:   options.useFactory(...args),
            }),
          },
        ]),
      ],
      providers: [RpcService],
      exports:   [RpcService],
    };
  }
}
