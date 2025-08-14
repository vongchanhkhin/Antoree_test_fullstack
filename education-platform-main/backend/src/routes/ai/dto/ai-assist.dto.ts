import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum AIAssistType {
  GRAMMAR_CHECK = 'grammar_check',
  CONTENT_SUGGESTIONS = 'content_suggestions',
  TITLE_SUGGESTIONS = 'title_suggestions',
  SUMMARY = 'summary',
  TRANSLATION = 'translation',
  DIFFICULTY_ANALYSIS = 'difficulty_analysis',
}

export class AIAssistRequestDto {
  @IsEnum(AIAssistType)
  type: AIAssistType;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string; // For translation

  @IsOptional()
  @IsString()
  context?: string; // Additional context for AI

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxSuggestions?: number; // For suggestions
}

export class AIAssistBatchDto {
  @IsString()
  postId: string;

  @IsEnum(AIAssistType, { each: true })
  types: AIAssistType[];

  @IsOptional()
  @IsString()
  targetLanguage?: string;
}
