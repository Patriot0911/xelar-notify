import { RpcException } from '@nestjs/microservices';
import { RpcError } from './rpc-result.model';

export class RpcBusinessException extends RpcException {
  constructor(
    public readonly rpcError: RpcError,
    public readonly message: string,
  ) {
    super(rpcError);
  }
}
