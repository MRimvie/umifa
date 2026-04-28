import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'admin@umifa.fr',
    type: String,
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'admin123',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Mot de passe requis' })
  password: string;
}
