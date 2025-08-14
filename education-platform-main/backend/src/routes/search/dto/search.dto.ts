import { IsString, IsOptional, IsEnum, IsIn } from 'class-validator';

export enum SearchType {
  ALL = 'all',
  POSTS = 'posts',
  COMMENTS = 'comments',
  USERS = 'users',
  TAGS = 'tags',
}

export class SearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  skills?: string; // comma-separated list

  @IsOptional()
  @IsString()
  tags?: string; // comma-separated list

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '20';

  @IsOptional()
  @IsIn(['relevance', 'date', 'votes'])
  sort?: 'relevance' | 'date' | 'votes' = 'relevance';
}
