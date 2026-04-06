import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Mot de passe requis' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Prénom requis' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nom requis' })
  lastName: string;

  @IsEnum(UserRole, { message: 'Rôle invalide' })
  @IsNotEmpty({ message: 'Rôle requis' })
  role: UserRole;

  @IsString()
  @IsOptional()
  schoolId?: string;

  @IsString()
  @IsOptional()
  centerId?: string;
}
