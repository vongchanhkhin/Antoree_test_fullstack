import { IsEnum, IsOptional, IsString, IsObject, IsUrl } from 'class-validator';

export enum MediaKind {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export class CreatePostMediaDto {
  @IsString()
  postId: string;

  @IsEnum(MediaKind)
  kind: MediaKind;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsObject()
  meta?: any; // JSON metadata like file info, dimensions, duration, etc.
}
