import { IsArray, IsBoolean, IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class JobQueryDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() workplace?: string;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() industry?: string;
}

export class UpsertJobDto {
  @IsString() @MinLength(3) title!: string;
  @IsString() @MinLength(20) summary!: string;
  @IsString() @MinLength(50) description!: string;
  @IsArray() @IsString({ each: true }) responsibilities!: string[];
  @IsArray() @IsString({ each: true }) qualifications!: string[];
  @IsString() city!: string;
  @IsString() state!: string;
  @IsString() workplace!: string;
  @IsString() employmentType!: string;
  @IsString() industry!: string;
  @IsOptional() @IsString() compensation?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsIn(['DRAFT', 'PUBLISHED', 'CLOSED']) status!: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  @IsOptional() @IsDateString() closesAt?: string;
}
