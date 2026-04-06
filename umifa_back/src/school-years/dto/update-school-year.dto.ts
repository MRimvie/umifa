import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolYearDto } from './create-school-year.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSchoolYearDto extends PartialType(CreateSchoolYearDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
