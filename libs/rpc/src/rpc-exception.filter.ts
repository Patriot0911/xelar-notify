import { RpcBusinessException, RpcError, TRpcCallResultModel, } from '@libs/shared/models';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<TRpcCallResultModel<any>> {
    if (host.getType() !== 'rpc') {
      throw exception;
    }

    if (exception instanceof RpcBusinessException) {
      return of({
        status: false,
        rpcError: exception.rpcError,
        message: exception.message,
        data: exception.data,
      });
    }

    console.log('[RPC Error]', exception);
    return of({
      status: false,
      rpcError: RpcError.INTERNAL_ERROR,
    });
  }
}