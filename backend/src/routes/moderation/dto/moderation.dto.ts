import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ModerationTarget {
  POST = 'post',
  COMMENT = 'comment',
}

export enum ModerationSource {
  REPORT = 'report',
  AUTO_SAFETY = 'auto_safety',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class QueryModerationDto {
  @IsOptional()
  @IsEnum(ModerationTarget)
  targetType?: ModerationTarget;

  @IsOptional()
  @IsEnum(ModerationSource)
  source?: ModerationSource;

  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class ModerationDecisionDto {
  @IsEnum(ModerationStatus)
  status: ModerationStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
