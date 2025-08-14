import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      search,
    );
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body('roleId') roleId: string,
  ) {
    return this.adminService.updateUserRole(userId, roleId);
  }

  @Get('moderation-queue')
  async getModerationQueue() {
    return this.adminService.getModerationQueue();
  }

  @Get('activity')
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }
}
