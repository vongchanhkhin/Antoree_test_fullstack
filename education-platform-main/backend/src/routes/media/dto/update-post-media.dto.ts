import { IsEnum, IsOptional, IsObject, IsUrl } from 'class-validator';
import { MediaKind } from './upload.dto';

export class UpdatePostMediaDto {
  @IsOptional()
  @IsEnum(MediaKind)
  kind?: MediaKind;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsObject()
  meta?: any;
}
