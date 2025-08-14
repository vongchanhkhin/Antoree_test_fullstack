import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportTarget } from './create-report.dto';

export class QueryReportsDto {
  @IsOptional()
  @IsEnum(ReportTarget)
  targetType?: ReportTarget;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  reporterId?: string;

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
