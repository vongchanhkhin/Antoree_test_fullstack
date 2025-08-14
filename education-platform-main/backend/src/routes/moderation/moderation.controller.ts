import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import {
  CreateReportDto,
  QueryReportsDto,
  QueryModerationDto,
  ModerationDecisionDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('v1/moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  async createReport(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.moderationService.createReport(createReportDto, req.user.id);
  }

  @Get('reports')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async getReports(@Query() query: QueryReportsDto) {
    return this.moderationService.getReports(query);
  }

  @Get('queue')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async getModerationQueue(@Query() query: QueryModerationDto) {
    return this.moderationService.getModerationQueue(query);
  }

  @Put('queue/:id/moderate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async moderateContent(
    @Param('id') id: string,
    @Body() decision: ModerationDecisionDto,
    @Request() req,
  ) {
    return this.moderationService.moderateContent(id, decision, req.user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  async getModerationStats() {
    return this.moderationService.getModerationStats();
  }
}
