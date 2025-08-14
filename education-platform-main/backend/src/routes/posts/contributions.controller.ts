import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import {
  CreateContributionDto,
  ApproveContributionDto,
} from './dto/contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('v1/posts')
@UseGuards(JwtAuthGuard)
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  // POST /v1/posts/:id/contributions
  @Post(':id/contributions')
  async createContribution(
    @Param('id') postId: string,
    @Body() createContributionDto: CreateContributionDto,
    @Request() req: any,
  ) {
    return this.contributionsService.createContribution(
      postId,
      req.user.id,
      createContributionDto,
    );
  }

  // GET /v1/posts/:id/contributions
  @Get(':id/contributions')
  async getPostContributions(
    @Param('id') postId: string,
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
  ) {
    return this.contributionsService.getPostContributions(postId, status);
  }

  // PATCH /v1/contributions/:id/approve (for moderators)
  @Patch('contributions/:id/moderate')
  async moderateContribution(
    @Param('id') contributionId: string,
    @Body() approveDto: ApproveContributionDto,
    @Request() req: any,
  ) {
    return this.contributionsService.moderateContribution(
      contributionId,
      req.user.id,
      approveDto,
    );
  }

  // GET /v1/contributors/stats (for leaderboard)
  @Get('contributors/stats')
  async getContributionStats(
    @Query('period') period: 'week' | 'month' = 'week',
  ) {
    return this.contributionsService.getContributionStats(period);
  }
}
