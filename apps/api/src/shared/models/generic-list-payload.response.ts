export interface IGenericListMeta {
  count: number;
};

export interface IGenericListPayloadResponse<T, D = IGenericListMeta> {
  items: T[];
  meta: D;
};
