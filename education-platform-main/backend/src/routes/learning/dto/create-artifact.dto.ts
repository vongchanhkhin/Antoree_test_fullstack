import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export enum ArtifactType {
  QUIZ = 'quiz',
  FLASHCARDS = 'flashcards',
  EXPLAIN = 'explain',
}

export enum ArtifactStatus {
  READY = 'ready',
  GENERATING = 'generating',
  FAILED = 'failed',
}

export class CreateArtifactDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsEnum(ArtifactType)
  type: ArtifactType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateQuizDto {
  @IsString()
  artifactId: string;

  @IsArray()
  questions: QuizQuestionDto[];
}

export class QuizQuestionDto {
  @IsString()
  stem: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsNumber()
  orderNo: number;

  @IsArray()
  options: QuizOptionDto[];
}

export class QuizOptionDto {
  @IsString()
  content: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateFlashcardsDto {
  @IsString()
  artifactId: string;

  @IsArray()
  flashcards: FlashcardDto[];
}

export class FlashcardDto {
  @IsString()
  front: string;

  @IsString()
  back: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsNumber()
  orderNo: number;
}
