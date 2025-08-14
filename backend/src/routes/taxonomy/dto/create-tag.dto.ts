import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string; // Hex color for UI
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class QueryTagsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '50';

  @IsOptional()
  @IsString()
  sort?: 'name' | 'posts' | 'created' = 'name';
}
