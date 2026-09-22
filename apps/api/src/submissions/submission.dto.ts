import { IsEmail, IsInt, IsOptional, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';

export class EmployerRequestDto {
  @IsString() @MinLength(2) companyName!: string;
  @IsString() @MinLength(2) contactName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
  @IsString() industry!: string;
  @IsString() @MinLength(5) rolesNeeded!: string;
  @IsInt() @Min(1) @Max(1000) headcount!: number;
  @IsString() startTimeline!: string;
  @IsString() engagementType!: string;
  @IsOptional() @IsString() additionalDetail?: string;
}

export type CandidateFields = {
  firstName: string; lastName: string; email: string; phone: string; city?: string; state?: string;
  linkedInUrl?: string; yearsExp?: string; skills?: string; coverLetter?: string; jobId: string; consent?: string;
};

export type TalentFields = {
  firstName: string; lastName: string; email: string; phone: string; preferredRoles: string;
  preferredArea?: string; workPreference?: string; consent?: string;
};
