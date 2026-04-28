import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchoolYearsService } from './school-years.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('school-years')
@ApiBearerAuth('JWT-auth')
@Controller('school-years')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolYearsController {
  constructor(private readonly schoolYearsService: SchoolYearsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une année scolaire',
    description: 'Créer une nouvelle année scolaire',
  })
  @ApiResponse({
    status: 201,
    description: 'Année scolaire créée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        year: '2023-2024',
        startDate: '2023-09-01T00:00:00.000Z',
        endDate: '2024-06-30T00:00:00.000Z',
        status: 'INSCRIPTION',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Année scolaire déjà existante',
    schema: {
      example: {
        statusCode: 409,
        message: 'Année scolaire déjà existante',
        error: 'Conflict',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createSchoolYearDto: CreateSchoolYearDto) {
    return this.schoolYearsService.create(createSchoolYearDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste de toutes les années scolaires',
    description: 'Récupère toutes les années scolaires',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des années scolaires récupérées avec succès',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          year: '2023-2024',
          startDate: '2023-09-01T00:00:00.000Z',
          endDate: '2024-06-30T00:00:00.000Z',
          status: 'INSCRIPTION',
          isActive: true,
          createdAt: '2026-03-02T19:00:00.000Z',
          updatedAt: '2026-03-02T19:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Année scolaire déjà existante',
    schema: {
      example: {
        statusCode: 409,
        message: 'Année scolaire déjà existante',
        error: 'Conflict',
      },
    },
  })
  findAll() {
    return this.schoolYearsService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Année scolaire active',
    description: "Récupère l'année scolaire active",
  })
  @ApiResponse({
    status: 200,
    description: 'Année scolaire active récupérée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        year: '2023-2024',
        startDate: '2023-09-01T00:00:00.000Z',
        endDate: '2024-06-30T00:00:00.000Z',
        status: 'INSCRIPTION',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Année scolaire non trouvée',
        error: 'Not Found',
      },
    },
  })
  findActive() {
    return this.schoolYearsService.findActive();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détails d'une année scolaire",
    description: "Récupère les informations d'une année scolaire donnée",
  })
  @ApiResponse({
    status: 200,
    description: "Détails de l'année scolaire récupérés avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        year: '2023-2024',
        startDate: '2023-09-01T00:00:00.000Z',
        endDate: '2024-06-30T00:00:00.000Z',
        status: 'INSCRIPTION',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Année scolaire non trouvée',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.schoolYearsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une année scolaire',
    description: "Modifie les informations d'une année scolaire donnée",
  })
  @ApiResponse({
    status: 200,
    description: 'Année scolaire mise à jour avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        year: '2023-2024',
        startDate: '2023-09-01T00:00:00.000Z',
        endDate: '2024-06-30T00:00:00.000Z',
        status: 'INSCRIPTION',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Année scolaire non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateSchoolYearDto: UpdateSchoolYearDto) {
    return this.schoolYearsService.update(id, updateSchoolYearDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une année scolaire',
    description: 'Supprime une année scolaire donnée',
  })
  @ApiResponse({
    status: 200,
    description: 'Année scolaire supprimée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Année scolaire non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Année scolaire non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.schoolYearsService.remove(id);
  }
}
