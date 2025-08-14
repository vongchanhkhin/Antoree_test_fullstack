import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryPostsDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  q?: string; // Search query

  @IsOptional()
  @IsString()
  level?: string; // Level ID for filtering

  @IsOptional()
  @IsString()
  tag?: string; // Tag slug for filtering

  @IsOptional()
  @IsIn(['new', 'hot'])
  sort?: 'new' | 'hot';
}
