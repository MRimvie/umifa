import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolDto } from './create-school.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
