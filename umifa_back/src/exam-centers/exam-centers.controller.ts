import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExamCentersService } from './exam-centers.service';
import { CreateExamCenterDto } from './dto/create-exam-center.dto';
import { UpdateExamCenterDto } from './dto/update-exam-center.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('exam-centers')
@ApiBearerAuth('JWT-auth')
@Controller('exam-centers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamCentersController {
  constructor(private readonly examCentersService: ExamCentersService) {}

  @Post()
  @ApiOperation({
    summary: "Créer un centre d'examen",
    description: "Créer un nouveau centre d'examen",
  })
  @ApiResponse({
    status: 201,
    description: "Centre d'examen créé avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: "Centre d'examen Manga",
        address: '123 Rue de la Paix, Manga 75001',
        capacity: 100,
        phone: '01 23 45 67 89',
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
        message: 'Ce nom est déjà utilisé',
        error: 'Conflict',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createExamCenterDto: CreateExamCenterDto) {
    return this.examCentersService.create(createExamCenterDto);
  }

  @Get()
  @ApiOperation({
    summary: "Liste de tous les centres d'examen",
    description: "Récupère tous les centres d'examen",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des centres d'examen récupérés avec succès",
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: "Centre d'examen Manga",
          address: '123 Rue de la Manga, Paris 75001',
          capacity: 100,
          phone: '01 23 45 67 89',
          isActive: true,
          createdAt: '2026-03-02T19:00:00.000Z',
          updatedAt: '2026-03-02T19:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: "Aucun centre d'examen trouvé",
    schema: {
      example: {
        statusCode: 404,
        message: "Aucun centre d'examen trouvé",
        error: 'Not Found',
      },
    },
  })
  findAll() {
    return this.examCentersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détails d'un centre d'examen",
    description: "Récupère les informations d'un centre d'examen donné",
  })
  @ApiResponse({
    status: 200,
    description: "Détails du centre d'examen récupéré avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: "Centre d'examen Manga",
        address: '123 Rue de la Paix, Manga 75001',
        capacity: 100,
        phone: '01 23 45 67 89',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Centre d'examen non trouvé",
    schema: {
      example: {
        statusCode: 404,
        message: "Centre d'examen non trouvé",
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.examCentersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Mettre à jour un centre d'examen",
    description: "Modifie les informations d'un centre d'examen donné",
  })
  @ApiResponse({
    status: 200,
    description: "Centre d'examen mis à jour avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: "Centre d'examen Manga",
        address: '123 Rue de la Manga, Paris 75001',
        capacity: 100,
        phone: '01 23 45 67 89',
        isActive: true,
        createdAt: '2026-03-02T19:00:00.000Z',
        updatedAt: '2026-03-02T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Centre d'examen non trouvé",
    schema: {
      example: {
        statusCode: 404,
        message: "Centre d'examen non trouvé",
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateExamCenterDto: UpdateExamCenterDto) {
    return this.examCentersService.update(id, updateExamCenterDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Supprimer un centre d'examen",
    description: "Supprime un centre d'examen donné",
  })
  @ApiResponse({
    status: 200,
    description: "Centre d'examen supprimé avec succès",
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Centre d'examen non trouvé",
    schema: {
      example: {
        statusCode: 404,
        message: "Centre d'examen non trouvé",
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.examCentersService.remove(id);
  }
}
