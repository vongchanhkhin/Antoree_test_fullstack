import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto';

@Controller('v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() searchDto: SearchDto) {
    return this.searchService.search(searchDto);
  }

  @Get('suggestions')
  getSuggestions(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.getSuggestions(
      query,
      limit ? parseInt(limit) : undefined,
    );
  }
}
