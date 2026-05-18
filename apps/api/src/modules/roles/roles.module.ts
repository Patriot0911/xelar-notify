import { RoleEntity } from '@libs/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesMapper } from './mappers';
import { RolesService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
    ]),
  ],
  providers: [
    RolesMapper,
    RolesService,
  ],
  exports: [
    RolesMapper,
    RolesService,
  ],
})
export class RolesModule {}
