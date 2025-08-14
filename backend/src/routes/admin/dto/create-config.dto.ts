import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export enum ConfigType {
  SYSTEM = 'system',
  FEATURE = 'feature',
  CONTENT = 'content',
  SECURITY = 'security',
}

export class CreateConfigDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: ConfigType;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isEditable?: boolean = true;
}

export class UpdateConfigDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  isEditable?: boolean;
}

export class BulkConfigUpdateDto {
  @IsObject()
  configs: Record<string, string>;
}
