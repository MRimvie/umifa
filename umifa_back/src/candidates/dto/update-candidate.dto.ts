import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @IsString()
  @IsOptional()
  centerId?: string;
}
