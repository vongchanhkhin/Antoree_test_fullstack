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
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, QueryPostsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/decorators/user.decorator';
import { VotesService } from '../votes/votes.service';
import { TargetType } from '../votes/dto/create-vote.dto';
import { CommentsService } from '../comments/comments.service';

@Controller('v1/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly votesService: VotesService,
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() user: RequestUser) {
    return this.postsService.createPost(createPostDto, user.id);
  }

  @Get()
  findAll(@Query() queryDto: QueryPostsDto) {
    return this.postsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @User() user: RequestUser,
  ) {
    return this.postsService.updatePost(id, updatePostDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: RequestUser) {
    return this.postsService.deletePost(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(@Param('id') id: string, @User() user: RequestUser) {
    return this.postsService.publishPost(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/votes')
  voteOnPost(
    @Param('id') id: string,
    @Body() body: { value: 1 | -1 },
    @User() user: RequestUser,
  ) {
    return this.votesService.createVote(
      {
        targetId: id,
        targetType: TargetType.POST,
        value: body.value,
      },
      user.id,
    );
  }

  @Get(':id/comments')
  getPostComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findAll({
      postId: id,
      page: page || '1',
      limit: limit || '20',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  createPostComment(
    @Param('id') id: string,
    @Body() body: { content: string; parentId?: string },
    @User() user: RequestUser,
  ) {
    return this.commentsService.createComment(
      {
        content: body.content,
        postId: id,
        parentId: body.parentId,
      },
      user.id,
    );
  }
}
