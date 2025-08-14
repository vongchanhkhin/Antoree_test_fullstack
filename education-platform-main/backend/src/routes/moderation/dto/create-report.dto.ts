import { IsEnum, IsString } from 'class-validator';

export enum ReportTarget {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
}

export class CreateReportDto {
  @IsEnum(ReportTarget)
  targetType: ReportTarget;

  @IsString()
  targetId: string;

  @IsString()
  reason: string;
}
