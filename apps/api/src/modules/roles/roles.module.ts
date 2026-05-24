import { RoleEntity, UserEntity } from '@libs/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesMapper } from './mappers';
import { RolesService } from './services';
import { RolesController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      UserEntity,
    ]),
  ],
  controllers: [RolesController],
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
