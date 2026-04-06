import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty({ message: 'Candidat requis' })
  candidateId: string;

  @IsString()
  @IsNotEmpty({ message: 'Matière requise' })
  subject: string;

  @IsNumber()
  @Min(0, { message: 'La note doit être au minimum 0' })
  @Max(20, { message: 'La note doit être au maximum 20' })
  @IsNotEmpty({ message: 'Note requise' })
  score: number;
}
