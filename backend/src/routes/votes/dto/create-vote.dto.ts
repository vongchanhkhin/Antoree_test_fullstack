import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export class CreateVoteDto {
  @IsUUID()
  targetId: string;

  @IsEnum(TargetType)
  targetType: TargetType;

  @IsNumber()
  @IsIn([-1, 1])
  value: number; // -1 for downvote, 1 for upvote
}

export class QueryVotesDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @IsOptional()
  @IsNumber()
  @IsIn([-1, 1])
  value?: number;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '20';
}
