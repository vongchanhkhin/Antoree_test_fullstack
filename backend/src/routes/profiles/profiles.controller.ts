import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('v1/profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.profilesService.getProfile(id);
  }

  @Patch(':id')
  updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.profilesService.updateProfile(
      id,
      updateProfileDto,
      currentUserId,
    );
  }

  @Get(':id/badges')
  getProfileBadges(@Param('id') id: string) {
    return this.profilesService.getProfileBadges(id);
  }

  @Get(':id/stats')
  getProfileStats(@Param('id') id: string) {
    return this.profilesService.getProfileStats(id);
  }
}
