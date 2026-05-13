import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { ITwitchApiChannelNormalizedModel } from './twitch-api';
import { ITwitchApiPaginationModel } from './twitch-api-pagination.model';

export type TSearchTwitchChannelsResponseModel = IGenericListPayloadResponse<ITwitchApiChannelNormalizedModel, ITwitchApiPaginationModel>;
