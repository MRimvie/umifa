import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Nom requis' })
  name: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  noteMax?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
