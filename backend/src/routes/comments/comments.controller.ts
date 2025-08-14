import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, QueryCommentsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/decorators/user.decorator';

@Controller('v1/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @User() user: RequestUser,
  ) {
    return this.commentsService.createComment(createCommentDto, user.id);
  }

  @Get()
  findAll(@Query() queryDto: QueryCommentsDto) {
    return this.commentsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Get(':id/replies')
  getReplies(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.getReplies(
      id,
      parseInt(page || '1'),
      parseInt(limit || '10'),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @User() user: RequestUser,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: RequestUser) {
    return this.commentsService.deleteComment(id, user.id);
  }
}
