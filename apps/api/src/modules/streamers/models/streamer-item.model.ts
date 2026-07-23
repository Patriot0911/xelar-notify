import { IStreamerListItemModel } from './streamer-list-item.model';

export interface IStreamerItemModel extends IStreamerListItemModel {
  linkedUserDisplayName: string | null;
  linkedUserEmail: string | null;
};
