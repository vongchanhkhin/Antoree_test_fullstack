import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { VotesModule } from '../votes/votes.module';
import { CommentsService } from '../comments/comments.service';

@Module({
  imports: [VotesModule],
  controllers: [PostsController, ContributionsController],
  providers: [PostsService, ContributionsService, CommentsService],
  exports: [PostsService, ContributionsService],
})
export class PostsModule {}
