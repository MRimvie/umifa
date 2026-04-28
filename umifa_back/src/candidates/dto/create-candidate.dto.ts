import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'Numéro PV du candidat',
    example: 'PV-2025-001',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  numeroPV?: string;

  @ApiProperty({
    description: 'Prénom du candidat',
    example: 'Ahmed',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Prénom requis' })
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille du candidat',
    example: 'Benali',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nom requis' })
  lastName: string;

  @ApiProperty({
    description: 'Sexe du candidat',
    enum: Gender,
    example: Gender.MASCULIN,
  })
  @IsEnum(Gender, { message: 'Sexe invalide' })
  @IsNotEmpty({ message: 'Sexe requis' })
  gender: Gender;

  @ApiProperty({
    description: 'Date de naissance du candidat (format ISO 8601)',
    example: '2010-05-15',
    type: String,
  })
  @IsDateString()
  @IsNotEmpty({ message: 'Date de naissance requise' })
  dateOfBirth: string;

  @ApiProperty({
    description: 'Lieu de naissance du candidat',
    example: 'Paris',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Lieu de naissance requis' })
  placeOfBirth: string;

  @ApiProperty({
    description: 'Nationalité du candidat',
    example: 'Française',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nationalité requise' })
  nationality: string;

  @ApiProperty({
    description: "ID de l'école/médersa du candidat",
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'École requise' })
  schoolId: string;

  @ApiProperty({
    description: "ID de l'année scolaire",
    example: '660e8400-e29b-41d4-a716-446655440001',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Année scolaire requise' })
  schoolYearId: string;
}
