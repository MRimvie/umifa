import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('schools')
@ApiBearerAuth('JWT-auth')
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une école',
    description: 'Créer une nouvelle école dans le système',
  })
  @ApiResponse({
    status: 201,
    description: 'École créée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Medersa Al-Ihsan',
        address: '123 Rue de la Paix, Paris 75001',
        phone: '01 23 45 67 89',
        email: 'contact@alihsan.fr',
        contactName: 'Directeur Al-Ihsan',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Nom déjà utilisé',
    schema: {
      example: {
        statusCode: 409,
        message: "Ce nom d'école est déjà utilisé",
        error: 'Conflict',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste de toutes les écoles',
    description: 'Recuperer la liste de toutes eles écoles',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des écoles récupérée avec succès',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Medersa Al-Ihsan',
          address: '123 Rue de la Paix, Paris 75001',
          phone: '01 23 45 67 89',
          email: 'contact@alihsan.fr',
          contactName: 'Directeur Al-Ihsan',
          isActive: true,
          createdAt: '2026-03-02T19:00:00.000Z',
          updatedAt: '2026-03-02T19:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'École non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'École non trouvée',
        error: 'Not Found',
      },
    },
  })
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'une école",
    description: "Recuperer les informations d'une école",
  })
  @ApiResponse({
    status: 200,
    description: "Détail de l'école récupéré avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Medersa Al-Ihsan',
        address: '123 Rue de la Paix, Paris 75001',
        phone: '01 23 45 67 89',
        email: 'contact@alihsan.fr',
        contactName: 'Directeur Al-Ihsan',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'École non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'École non trouvée',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une école',
    description: "Modifie les informations d'une école donnée",
  })
  @ApiResponse({
    status: 200,
    description: 'École mise à jour avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Medersa Al-Ihsan',
        address: '123 Rue de la Paix, Paris 75001',
        phone: '01 23 45 67 89',
        email: 'contact@alihsan.fr',
        contactName: 'Directeur Al-Ihsan',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'École non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'École non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une école',
    description: 'Supprime une école donnée',
  })
  @ApiResponse({
    status: 200,
    description: 'École supprimée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'École non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'École non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }
}
