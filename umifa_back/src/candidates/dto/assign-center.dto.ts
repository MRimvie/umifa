import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignCenterDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Au moins un candidat requis' })
  @IsString({ each: true })
  candidateIds: string[];

  @IsString()
  @IsNotEmpty({ message: 'Centre d\'examen requis' })
  centerId: string;
}
