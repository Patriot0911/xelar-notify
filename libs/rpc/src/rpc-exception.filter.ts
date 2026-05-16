import { IGenericRpcResponse, RpcBusinessException, RpcError, } from '@libs/shared/models';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<IGenericRpcResponse<any>> {
    if (host.getType() !== 'rpc') {
      throw exception;
    }

    if (exception instanceof RpcBusinessException) {
      return of({
        status: false,
        message: exception.rpcError,
        data: exception.data,
      });
    }

    console.log('[RPC Error]', exception);
    return of({
      status: false,
      message: RpcError.INTERNAL_ERROR,
    });
  }
}