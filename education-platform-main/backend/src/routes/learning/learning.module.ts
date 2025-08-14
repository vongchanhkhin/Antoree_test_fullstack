import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [LearningService],
  controllers: [LearningController],
  exports: [LearningService],
})
export class LearningModule {}
