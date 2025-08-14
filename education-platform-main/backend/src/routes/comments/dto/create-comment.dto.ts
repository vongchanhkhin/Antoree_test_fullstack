import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  postId: string;

  @IsOptional()
  @IsUUID()
  parentId?: string; // For threaded replies
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}

export class QueryCommentsDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '20';

  @IsOptional()
  @IsString()
  sort?: 'new' | 'old' | 'top' = 'new';
}
