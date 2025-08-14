import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/decorators/user.decorator';
import {
  CreateArtifactDto,
  CreateQuizDto,
  CreateFlashcardsDto,
  QueryArtifactsDto,
  SubmitQuizDto,
} from './dto';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @UseGuards(JwtAuthGuard)
  @Post('artifacts')
  async createArtifact(
    @Body() dto: CreateArtifactDto,
    @User() user: RequestUser,
  ) {
    return this.learningService.createArtifact(dto, user.id);
  }

  @Get('artifacts')
  async getArtifacts(@Query() query: QueryArtifactsDto) {
    return this.learningService.getArtifacts(query);
  }

  @Get('artifacts/:id')
  async getArtifactById(@Param('id') id: string) {
    return this.learningService.getArtifactById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('artifacts/:id/quiz')
  async createQuiz(
    @Param('id') artifactId: string,
    @Body() dto: Omit<CreateQuizDto, 'artifactId'>,
    @User() user: RequestUser,
  ) {
    const createDto: CreateQuizDto = { ...dto, artifactId };
    return this.learningService.createQuiz(createDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('artifacts/:id/flashcards')
  async createFlashcards(
    @Param('id') artifactId: string,
    @Body() dto: Omit<CreateFlashcardsDto, 'artifactId'>,
    @User() user: RequestUser,
  ) {
    const createDto: CreateFlashcardsDto = { ...dto, artifactId };
    return this.learningService.createFlashcards(createDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('artifacts/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitQuiz(
    @Param('id') artifactId: string,
    @Body() dto: SubmitQuizDto,
    @User() user: RequestUser,
  ) {
    return this.learningService.submitQuiz(artifactId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('submissions')
  async getUserSubmissions(
    @Query('artifactId') artifactId: string,
    @User() user: RequestUser,
  ) {
    return this.learningService.getUserSubmissions(user.id, artifactId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getLearningStats(@User() user: RequestUser) {
    return this.learningService.getLearningStats(user.id);
  }

  @Get('admin/stats')
  async getAdminStats() {
    return this.learningService.getLearningStats();
  }
}
