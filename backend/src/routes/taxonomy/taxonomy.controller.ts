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
import { TaxonomyService } from './taxonomy.service';
import { CreateTagDto, UpdateTagDto, QueryTagsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('v1/taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @Post('tags')
  createTag(@Body() createTagDto: CreateTagDto) {
    return this.taxonomyService.createTag(createTagDto);
  }

  @Get('tags')
  findAllTags(@Query() queryDto: QueryTagsDto) {
    return this.taxonomyService.findAll(queryDto);
  }

  @Get('tags/popular')
  getPopularTags(@Query('limit') limit?: string) {
    return this.taxonomyService.getPopularTags(
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('tags/search')
  searchTags(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.taxonomyService.searchTags(
      query,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('tags/:id')
  findOneTag(@Param('id') id: string) {
    return this.taxonomyService.findOne(id);
  }

  @Get('tags/slug/:slug')
  findTagBySlug(@Param('slug') slug: string) {
    return this.taxonomyService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @Patch('tags/:id')
  updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.taxonomyService.updateTag(id, updateTagDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @Delete('tags/:id')
  removeTag(@Param('id') id: string) {
    return this.taxonomyService.deleteTag(id);
  }
}
