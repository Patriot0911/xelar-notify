export type IGenericRpcResponse<T = unknown, E = Record<string, unknown>> =
  ISuccessResponse<T> | IErrorResponse<E>;

export type ISuccessResponse<T> = {
  status: true;
  data: T;
};

export type IErrorResponse<E> = {
  status: false;
  message: string;
  data?: E;
};

export enum RpcError {
  NOT_REGISTERED = 'NOT_REGISTERED',
  STREAMER_NOT_FOUND = 'STREAMER_NOT_FOUND',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  DESTINATION_EXISTS = 'DESTINATION_EXISTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
};
