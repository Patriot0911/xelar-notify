import { registerAs } from '@nestjs/config';
import { IDatabaseConfigModel } from '../models';

const DATABASE_KEY = 'database';

export const databaseConfig = registerAs<IDatabaseConfigModel>(DATABASE_KEY, () => ({
  host:     process.env.DB_HOST!,
  port:     Number(process.env.DB_PORT!) || 5432,
  user:     process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  name:     process.env.DB_NAME!,
}));

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
