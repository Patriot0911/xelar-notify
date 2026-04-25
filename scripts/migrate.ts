import 'dotenv/config';
import { AppDataSource } from '../libs/database/src/data-source';

async function migrate() {
  try {
    await AppDataSource.initialize();
    const migrations = await AppDataSource.runMigrations();
    console.log(`Applied ${migrations.length} migrations`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

migrate();
