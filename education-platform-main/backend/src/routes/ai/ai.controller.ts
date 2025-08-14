import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AIAssistRequestDto, AIAssistBatchDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('v1/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('assist')
  processAIRequest(@Body() assistDto: AIAssistRequestDto) {
    return this.aiService.processAIRequest(assistDto);
  }

  @Post('batch-assist')
  async processBatchRequest(
    @Body() batchDto: AIAssistBatchDto,
    @Request() req,
  ) {
    return this.aiService.processBatchRequest(batchDto, req.user.id);
  }

  @Get('stats')
  getAIUsageStats(@Query('userId') userId?: string, @Request() req?) {
    // Only allow users to see their own stats unless admin
    const targetUserId =
      userId && req?.user?.roleId === 'admin' ? userId : req?.user?.id;
    return this.aiService.getAIUsageStats(targetUserId);
  }
}
