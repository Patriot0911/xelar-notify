import { IErrorResponse } from '@libs/shared';

export type TRpcCallResultModel<T, E = unknown> =
  | { status: true; data: T }
  | { status: false; error: IErrorResponse<E> };
