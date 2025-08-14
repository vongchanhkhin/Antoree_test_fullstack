import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/decorators/user.decorator';

@Controller('users')
// @UseGuards(JwtAuthGuard) // Temporarily removed to debug
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'teacher')
  async findAll(@Query('roleId') roleId?: string) {
    return this.usersService.findAll(roleId);
  }

  @Get('teachers')
  async getTeachers() {
    return this.usersService.getTeachers();
  }

  @Get('learners')
  @UseGuards(RolesGuard)
  @Roles('admin', 'teacher')
  async getLearners() {
    return this.usersService.getLearners();
  }

  @Get('moderators')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getModerators() {
    return this.usersService.getModerators();
  }

  @Get('profile')
  getProfile(@User() user: RequestUser) {
    return { user };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'teacher')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('profile')
  @Roles('teacher', 'learner')
  @UseGuards(RolesGuard)
  async updateProfile(
    @User() user: RequestUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('updateProfile called with user:', user);
    console.log('updateProfile called with data:', updateUserDto);

    if (!user) {
      console.log('No user found in request');
      return { error: 'No user found' };
    }

    // Remove roleId from update data for security (but allow levelId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roleId, ...updateData } = updateUserDto;
    console.log('Profile update - data received:', updateData);

    // Actually update the user profile in the database
    return await this.usersService.updateProfile(user.id, updateData);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
