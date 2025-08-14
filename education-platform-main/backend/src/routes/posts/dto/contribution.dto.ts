import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum ContributionType {
  EDIT = 'edit',
  ADD_EXAMPLE = 'add_example',
  ADD_QUESTION = 'add_question',
}

export enum ContributionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class CreateContributionDto {
  @IsEnum(ContributionType)
  type: ContributionType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ApproveContributionDto {
  @IsEnum(ContributionStatus)
  status: ContributionStatus;

  @IsOptional()
  @IsString()
  moderatorNote?: string;
}
