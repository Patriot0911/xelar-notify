import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../libs/database/src/data-source';
import { RoleEntity, Permission } from '../libs/database/src/entities/role.entity';
import { UserEntity, AccountStatus } from '../libs/database/src/entities/user.entity';

const ADMIN_ROLE_NAME = 'super admin';
const DEFAULT_ROLES: Pick<RoleEntity, 'name' | 'rolePriority' | 'permissions'>[] = [
  {
    name: ADMIN_ROLE_NAME,
    rolePriority: 100,
    permissions: Object.values(Permission),
  },
];

async function seed() {
  try {
    await AppDataSource.initialize();

    const roleRepo = AppDataSource.getRepository(RoleEntity);
    const userRepo = AppDataSource.getRepository(UserEntity);

    const existingRolesCount = await roleRepo.count();
    if (existingRolesCount === 0) {
      await roleRepo.save(DEFAULT_ROLES);
      console.log(`Seeded ${DEFAULT_ROLES.length} roles.`);
    } else {
      console.log('Roles already seeded, skipping.');
    }

    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });

      if (!existingAdmin) {
        const superAdminRole = await roleRepo.findOne({ where: { name: ADMIN_ROLE_NAME } });
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        await userRepo.save(
          userRepo.create({
            email: adminEmail,
            displayName: 'Admin',
            password: hashedPassword,
            balance: 0,
            status: AccountStatus.ACTIVE,
            roles: superAdminRole ? [superAdminRole] : [],
          }),
        );
        console.log(`Seeded admin: ${adminEmail}`);
      } else {
        console.log(`Admin already exists (${adminEmail}), skipping.`);
      }
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  }
}

seed();
