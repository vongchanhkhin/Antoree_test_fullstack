import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto, QueryVotesDto, TargetType } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/decorators/user.decorator';

@Controller('v1/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createVoteDto: CreateVoteDto, @User() user: RequestUser) {
    return this.votesService.createVote(createVoteDto, user.id);
  }

  @Get()
  findAll(@Query() queryDto: QueryVotesDto) {
    return this.votesService.findAll(queryDto);
  }

  @Get('stats/:targetType/:targetId')
  getStats(
    @Param('targetType') targetType: TargetType,
    @Param('targetId') targetId: string,
  ) {
    return this.votesService.getVoteStats(targetId, targetType);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:targetType/:targetId')
  getUserVote(
    @Param('targetType') targetType: TargetType,
    @Param('targetId') targetId: string,
    @User() user: RequestUser,
  ) {
    return this.votesService.getUserVote(user.id, targetId, targetType);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':targetType/:targetId')
  remove(
    @Param('targetType') targetType: TargetType,
    @Param('targetId') targetId: string,
    @User() user: RequestUser,
  ) {
    return this.votesService.removeVote(user.id, targetId, targetType);
  }
}
