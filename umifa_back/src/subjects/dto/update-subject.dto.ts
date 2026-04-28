import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  noteMax?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
