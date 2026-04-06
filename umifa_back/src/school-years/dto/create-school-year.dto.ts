import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';
import { SchoolYearStatus } from '@prisma/client';

export class CreateSchoolYearDto {
  @IsString()
  @IsNotEmpty({ message: 'Année scolaire requise (ex: 2025-2026)' })
  year: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Date de début requise' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Date de fin requise' })
  endDate: string;

  @IsEnum(SchoolYearStatus, { message: 'Statut invalide' })
  @IsNotEmpty({ message: 'Statut requis' })
  status: SchoolYearStatus;
}
