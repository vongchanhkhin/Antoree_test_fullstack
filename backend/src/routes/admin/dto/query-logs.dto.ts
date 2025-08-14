import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS = 'access',
  ERROR = 'error',
}

export class QueryAdminLogsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @IsOptional()
  @IsEnum(LogAction)
  action?: LogAction;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateLogDto {
  @IsString()
  userId: string;

  @IsEnum(LogLevel)
  level: LogLevel;

  @IsEnum(LogAction)
  action: LogAction;

  @IsString()
  resource: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
