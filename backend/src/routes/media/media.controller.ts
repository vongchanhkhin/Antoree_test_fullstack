import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import {
  CreatePostMediaDto,
  QueryPostMediaDto,
  UpdatePostMediaDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('v1/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  async createPostMedia(@Body() createDto: CreatePostMediaDto) {
    return this.mediaService.createPostMedia(createDto);
  }

  @Get()
  async getPostMedia(@Query() query: QueryPostMediaDto) {
    return this.mediaService.getPostMedia(query);
  }

  @Get('stats')
  async getMediaStats() {
    return this.mediaService.getMediaStats();
  }

  @Get('post/:postId')
  async getPostMediaByPostId(@Param('postId') postId: string) {
    return this.mediaService.getPostMediaByPostId(postId);
  }

  @Get(':id')
  async getPostMediaById(@Param('id') id: string) {
    return this.mediaService.getPostMediaById(id);
  }

  @Put(':id')
  async updatePostMedia(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostMediaDto,
  ) {
    return this.mediaService.updatePostMedia(id, updateDto);
  }

  @Delete(':id')
  async deletePostMedia(@Param('id') id: string) {
    return this.mediaService.deletePostMedia(id);
  }
}
