export interface ISearchStreamersPayload {
  search: string;
}

export interface ISearchStreamerItem {
  broadcasterId: string;
  broadcasterLogin: string;
  displayName: string;
}

export interface ISearchStreamersResult {
  items: ISearchStreamerItem[];
}
