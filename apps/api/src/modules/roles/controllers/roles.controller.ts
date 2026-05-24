import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services';
import { IAccessTokenPayload, JwtAccessGuard, PermissionsGuard } from '../../auth';
import { Permission } from '@libs/database';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { IRoleItemModel, IRoleListItemModel } from '../models';
import { Permissions } from '../../auth/decorator/permissions.decorator';
import { CreateRoleRequestDto, EditRoleRequestDto, GetRolesRequestDto } from '../dto';

@ApiTags('Roles')
@Controller('api/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.MANAGE_ROLES, Permission.ADMIN)
  async getAllRoles(@Query() params: GetRolesRequestDto): Promise<IGenericListPayloadResponse<IRoleListItemModel>> {
    return await this.rolesService.getAll(params);
  }

  @Get(':roleId')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.MANAGE_ROLES, Permission.ADMIN)
  async getRole(@Param('roleId') roleId: string): Promise<IRoleItemModel> {
    return await this.rolesService.getById(roleId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.MANAGE_ROLES, Permission.ADMIN)
  async createRole(@Body() data: CreateRoleRequestDto, @Req() request): Promise<IRoleItemModel> {
    const { sub, } = <IAccessTokenPayload> request.user;
    return await this.rolesService.createRole(data, sub);
  }

  @Put(':roleId')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.MANAGE_ROLES, Permission.ADMIN)
  async editRole(
    @Param('roleId') roleId: string,
    @Body() data: EditRoleRequestDto,
    @Req() request
  ): Promise<boolean> {
    const { sub, } = <IAccessTokenPayload> request.user;
    return await this.rolesService.editRole(data, roleId, sub);
  }

  @Delete(':roleId')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.MANAGE_ROLES, Permission.ADMIN)
  async deleteRole(@Param('roleId') roleId: string, @Req() request): Promise<IRoleItemModel> {
    const { sub, } = <IAccessTokenPayload> request.user;
    return await this.rolesService.deleteRole(roleId, sub);
  }
}
