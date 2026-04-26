import { registerAs } from '@nestjs/config';
import { IFeatureConfigModel } from '../models';

const FEATURE_KEY = 'features';

export const featureConfig = registerAs<IFeatureConfigModel>(FEATURE_KEY, () => ({
  ['register-email']: process.env.FEATURE_REGISTER_EMAIL === 'true',
}));

export type FeatureConfig = ReturnType<typeof featureConfig>;
