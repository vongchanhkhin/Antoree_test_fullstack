import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ArtifactType, ArtifactStatus } from './create-artifact.dto';

export class QueryArtifactsDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsEnum(ArtifactType)
  type?: ArtifactType;

  @IsOptional()
  @IsEnum(ArtifactStatus)
  status?: ArtifactStatus;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class SubmitQuizDto {
  @IsArray()
  answers: QuizAnswerDto[];
}

export class QuizAnswerDto {
  @IsString()
  questionId: string;

  @IsArray()
  selectedOptions: string[]; // Array of option IDs
}

export class UpdateArtifactDto {
  @IsOptional()
  @IsEnum(ArtifactStatus)
  status?: ArtifactStatus;

  @IsOptional()
  meta?: any;
}
