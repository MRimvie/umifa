import { PartialType } from '@nestjs/mapped-types';
import { CreateExamCenterDto } from './create-exam-center.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateExamCenterDto extends PartialType(CreateExamCenterDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
