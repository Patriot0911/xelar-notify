import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard, PermissionsGuard } from '../../auth/guards';
import { Permission } from '@libs/database';
import { Permissions } from '../../auth/decorator/permissions.decorator';
import { UsersService } from '../services';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { GetUsersRequestDto, UpdateUserBalanceDto, UpdateUserRolesDto, UpdateUserStatusDto } from '../dto';
import { IUserItemModel, IUserListItemModel, IUserNotificationLogModel, IUserSessionModel, IUserSubscriptionsModel } from '../models';
import { IAccessTokenPayload } from '../../auth/models';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, PermissionsGuard)
@Permissions(Permission.ADMIN)
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers(@Query() params: GetUsersRequestDto): Promise<IGenericListPayloadResponse<IUserListItemModel>> {
    return this.usersService.getAll(params);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by id' })
  async getUser(@Param('userId') userId: string): Promise<IUserItemModel> {
    return this.usersService.getById(userId);
  }

  @Get(':userId/sessions')
  @ApiOperation({ summary: 'Get active sessions of a user' })
  async getUserSessions(@Param('userId') userId: string): Promise<IUserSessionModel[]> {
    return this.usersService.getUserSessions(userId);
  }

  @Delete(':userId/sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user session' })
  async deleteUserSession(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    return this.usersService.deleteUserSession(userId, sessionId);
  }

  @Patch(':userId/roles')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update user roles' })
  async updateUserRoles(
    @Req() req: { user: IAccessTokenPayload },
    @Param('userId') userId: string,
    @Body() body: UpdateUserRolesDto,
  ): Promise<void> {
    const currentUser = req.user;
    return this.usersService.updateUserRoles(currentUser.sub, currentUser.permissions, userId, body.roleIds);
  }

  @Patch(':userId/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Block or unblock a user account' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: UpdateUserStatusDto,
  ): Promise<void> {
    return this.usersService.updateUserStatus(userId, body.status);
  }

  @Patch(':userId/balance')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update user balance' })
  async updateUserBalance(
    @Param('userId') userId: string,
    @Body() body: UpdateUserBalanceDto,
  ): Promise<void> {
    return this.usersService.updateUserBalance(userId, body.balance);
  }

  @Get(':userId/subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions (discord + webhook) of a user' })
  async getUserSubscriptions(@Param('userId') userId: string): Promise<IUserSubscriptionsModel> {
    return this.usersService.getUserSubscriptions(userId);
  }

  @Get(':userId/notification-logs')
  @ApiOperation({ summary: 'Get notification logs of a user' })
  async getUserNotificationLogs(@Param('userId') userId: string): Promise<IUserNotificationLogModel[]> {
    return this.usersService.getUserNotificationLogs(userId);
  }
}
