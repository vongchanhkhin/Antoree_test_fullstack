import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaKind } from './upload.dto';

export class QueryPostMediaDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsEnum(MediaKind)
  kind?: MediaKind;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
