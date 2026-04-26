import { registerAs } from '@nestjs/config';
import { IAuthConfigModel } from '../models';

const AUTH_KEY = 'auth';

export const authConfig = registerAs<IAuthConfigModel>(AUTH_KEY, () => ({
  jwt: {
    secret: {
      access: process.env.JWT_SECRET_ACCESS!,
      refresh: process.env.JWT_SECRET_REFRESH!,
    },
    ttl: {
      access: parseInt(process.env.JWT_TTL_ACCESS!),
      refresh: parseInt(process.env.JWT_TTL_REFRESH!),
    },
  },
}));

export type AuthConfig = ReturnType<typeof authConfig>;
