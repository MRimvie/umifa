import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Authentifie un utilisateur avec email et mot de passe
   * Retourne un token JWT valide pour 7 jours et les informations de l'utilisateur
   * @param loginDto - Email et mot de passe de l'utilisateur
   * @returns Token JWT et données utilisateur (id, email, nom, prénom, rôle)
   */
  @Post('login')
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur et retourne un token JWT',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      superAdmin: {
        summary: 'Super Administrateur',
        value: {
          email: 'admin@umifa.fr',
          password: 'admin123',
        },
      },
      schoolManager: {
        summary: "Responsable d'école",
        value: {
          email: 'manager@alihsan.fr',
          password: 'admin123',
        },
      },
      grader: {
        summary: 'Correcteur',
        value: {
          email: 'grader@umifa.fr',
          password: 'admin123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@umifa.fr',
          firstName: 'Admin',
          lastName: 'UMIFA',
          role: 'SUPER_ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides',
    schema: {
      example: {
        statusCode: 401,
        message: 'Identifiants invalides',
        error: 'Unauthorized',
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}
