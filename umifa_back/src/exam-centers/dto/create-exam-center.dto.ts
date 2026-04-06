import { IsNotEmpty, IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateExamCenterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nom du centre requis' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Adresse requise' })
  address: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty({ message: 'Capacité requise' })
  capacity: number;

  @IsString()
  @IsOptional()
  phone?: string;
}
