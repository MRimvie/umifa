import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un utilisateur',
    description: 'Créer un nouvel utilisateur dans le système',
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@umifa.fr',
        firstName: 'Admin',
        lastName: 'UMIFA',
        role: 'SUPER_ADMIN',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé',
    schema: {
      example: {
        statusCode: 409,
        message: 'Cet email est déjà utilisé',
        error: 'Conflict',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste de tous les utilisateurs',
    description: 'Récupère tous les utilisateurs',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@umifa.fr',
          firstName: 'Admin',
          lastName: 'UMIFA',
          role: 'SUPER_ADMIN',
        },
      ],
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détails d'un utilisateur",
    description: "Récupère les informations d'un utilisateur donné",
  })
  @ApiResponse({
    status: 200,
    description: "Détails de l'utilisateur récupérés avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@umifa.fr',
        firstName: 'Admin',
        lastName: 'UMIFA',
        role: 'SUPER_ADMIN',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
    schema: {
      example: {
        statusCode: 404,
        message: 'Utilisateur non trouvé',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
    description: "Modifie les informations d'un utilisateur donné",
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@umifa.fr',
        firstName: 'Admin',
        lastName: 'UMIFA',
        role: 'SUPER_ADMIN',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
    schema: {
      example: {
        statusCode: 404,
        message: 'Utilisateur non trouvé',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description: 'Supprimé un utilisateur donné',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
    schema: {
      example: {
        statusCode: 404,
        message: 'Utilisateur non trouvé',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
