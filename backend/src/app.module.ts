import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './routes/posts/posts.module';
import { AuthModule } from './routes/auth/auth.module';
import { UsersModule } from './routes/users/users.module';
import { SharedModule } from './shared/shared.module';
import { JwtMiddleware } from './middleware/jwt.middleware';
import { RolesGuard } from './routes/auth/guards/roles.guard';
import { ProfilesModule } from './routes/profiles/profiles.module';
import { ContentModule } from './routes/content/content.module';
import { CommentsModule } from './routes/comments/comments.module';
import { VotesModule } from './routes/votes/votes.module';
import { TaxonomyModule } from './routes/taxonomy/taxonomy.module';
import { SearchModule } from './routes/search/search.module';
import { ModerationModule } from './routes/moderation/moderation.module';
import { MediaModule } from './routes/media/media.module';
import { AiModule } from './routes/ai/ai.module';
import { LearningModule } from './routes/learning/learning.module';
import { AdminModule } from './routes/admin/admin.module';

@Module({
  imports: [
    PostsModule,
    AuthModule,
    UsersModule,
    SharedModule,
    ProfilesModule,
    ContentModule,
    CommentsModule,
    VotesModule,
    TaxonomyModule,
    SearchModule,
    ModerationModule,
    MediaModule,
    AiModule,
    LearningModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Re-enable global RolesGuard to see if we get better error messages
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Re-enable JWT middleware for authentication
    consumer.apply(JwtMiddleware).forRoutes('*');
  }
}
