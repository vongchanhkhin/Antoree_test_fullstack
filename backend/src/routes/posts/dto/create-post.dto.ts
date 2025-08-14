import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
} from 'class-validator';
import { LevelId } from '../../profiles/dto/update-profile.dto';

export enum SkillType {
  READING = 'reading',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  VOCAB = 'vocab',
  GRAMMAR = 'grammar',
}

export class MediaDto {
  @IsString()
  @IsEnum(['image', 'audio'])
  type: 'image' | 'audio';

  @IsString()
  @IsUrl()
  url: string;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(LevelId)
  levelId?: LevelId;

  @IsArray()
  @IsEnum(SkillType, { each: true })
  skills: SkillType[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  media?: (MediaDto | string)[];

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  // These fields are sent by frontend but not stored in DB - will be ignored
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(LevelId)
  levelId?: LevelId;

  @IsOptional()
  @IsArray()
  @IsEnum(SkillType, { each: true })
  skills?: SkillType[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class QueryPostsDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(LevelId)
  level?: LevelId;

  @IsOptional()
  @IsString()
  q?: string; // search query

  @IsOptional()
  @IsEnum(['hot', 'new'])
  sort?: 'hot' | 'new' = 'hot';

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '20';
}
