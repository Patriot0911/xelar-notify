export type ISuccessResponse<T> = {
  status: true;
  data: T;
};

export type IErrorResponse<E> = {
  status: false;
  message: string;
  data?: E;
};

export type TRpcCallResultModel<T, E = Record<string, unknown>> =
  | { status: true; data: T; }
  | IErrorResponse<E>;


export enum RpcError {
  NOT_REGISTERED       = 'NOT_REGISTERED',
  STREAMER_NOT_FOUND   = 'STREAMER_NOT_FOUND',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  DESTINATION_EXISTS   = 'DESTINATION_EXISTS',
  VALIDATION_ERROR     = 'VALIDATION_ERROR',
  NOT_FOUND            = 'NOT_FOUND',
  FORBIDDEN            = 'FORBIDDEN',
  INTERNAL_ERROR       = 'INTERNAL_ERROR',
};
