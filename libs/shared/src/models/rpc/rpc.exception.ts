import { RpcException } from '@nestjs/microservices';
import { RpcError } from './rpc-result.model';

export class RpcBusinessException<D = unknown> extends RpcException {
  readonly rpcError: RpcError;
  readonly data?: D;

  constructor(rpcError: RpcError, _message: string, data?: D) {
    super(rpcError);
    this.rpcError = rpcError;
    this.data = data;
  }
}
