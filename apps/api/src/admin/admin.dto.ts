import { IsIn } from 'class-validator';

export class ApplicationStatusDto {
  @IsIn(['NEW', 'REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'])
  status!: 'NEW' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
}
