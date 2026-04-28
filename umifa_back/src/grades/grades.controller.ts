import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('grades')
@ApiBearerAuth('JWT-auth')
@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiOperation({
    summary: 'Saisir une note',
    description: 'Saisit une note pour un candidat',
  })
  @ApiResponse({
    status: 201,
    description: 'Note créée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        candidate: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          firstName: 'Ahmed',
          lastName: 'Benali',
          school: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Medersa Al-Ihsan',
          },
        },
        center: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: "Centre d'examen Paris",
        },
        subject: 'FRANCAIS',
        score: 18,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Échec de la saisie de la note',
    schema: {
      example: {
        statusCode: 400,
        message: 'Échec de la saisie de la note',
        error: 'Bad Request',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN, UserRole.GRADER)
  create(@Body() createGradeDto: CreateGradeDto, @Req() req: Request) {
    return this.gradesService.create(createGradeDto, req.user as any);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Saisir plusieurs notes',
    description: 'Saisit plusieurs notes pour des candidats',
  })
  @ApiResponse({
    status: 201,
    description: 'Notes créées avec succès',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          candidate: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            firstName: 'Ahmed',
            lastName: 'Benali',
            school: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Medersa Al-Ihsan',
            },
          },
          center: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: "Centre d'examen Paris",
          },
          subject: 'FRANCAIS',
          score: 18,
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur lors de la saisie des notes',
    schema: {
      example: {
        statusCode: 400,
        message: 'Erreur lors de la saisie des notes',
        error: 'Bad Request',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN, UserRole.GRADER)
  createBulk(@Body() grades: CreateGradeDto[], @Req() req: Request) {
    return this.gradesService.createBulk(grades, req.user as any);
  }

  @Post('calculate/:candidateId')
  @ApiOperation({
    summary: 'Calculer les résultats',
    description: 'Calcule les résultats pour un candidat donné',
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats calculés avec succès',
    schema: {
      example: {
        candidateId: '550e8400-e29b-41d4-a716-446655440000',
        results: [
          {
            subject: 'FRANCAIS',
            score: 18,
          },
          {
            subject: 'MATH',
            score: 16,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Candidat non trouvé',
    schema: {
      example: {
        statusCode: 404,
        message: 'Candidat non trouvé',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN, UserRole.GRADER)
  calculateResults(@Param('candidateId') candidateId: string) {
    return this.gradesService.calculateResults(candidateId);
  }

  @Post('calculate-all')
  @ApiOperation({ summary: 'Calculer toutes les moyennes', description: 'Calcule les résultats pour tous les candidats notés d\'une année scolaire' })
  @Roles(UserRole.SUPER_ADMIN)
  calculateAll(
    @Query('schoolYearId') schoolYearId: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.gradesService.calculateAll(schoolYearId, centerId);
  }

  @Get('results')
  @ApiOperation({ summary: 'Résultats des candidats', description: 'Retourne les résultats calculés pour tous les candidats d\'une année scolaire' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.GRADER)
  getResults(
    @Query('schoolYearId') schoolYearId: string,
    @Query('centerId') centerId?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.gradesService.getResults(schoolYearId, centerId, schoolId);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des notes',
    description: 'Récupère toutes les notes',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des notes récupérées avec succès',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          candidate: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            firstName: 'Ahmed',
            lastName: 'Benali',
            school: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Medersa Al-Ihsan',
            },
          },
          center: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: "Centre d'examen Paris",
          },
          subject: 'FRANCAIS',
          score: 18,
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Aucune note trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Aucune note trouvée',
        error: 'Not Found',
      },
    },
  })
  findAll(@Query('candidateId') candidateId?: string, @Query('centerId') centerId?: string) {
    return this.gradesService.findAll(candidateId, centerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'une note",
    description: "Recuperer les informations d'une note donnée",
  })
  @ApiResponse({
    status: 200,
    description: 'Détail de la note récupéré avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        candidate: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          firstName: 'Ahmed',
          lastName: 'Benali',
          school: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Medersa Al-Ihsan',
          },
        },
        center: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: "Centre d'examen Paris",
        },
        subject: 'FRANCAIS',
        score: 18,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Note non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Note non trouvée',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à  jour une note',
    description: "Modifier les informations d'une note donnée",
  })
  @ApiResponse({
    status: 200,
    description: 'Note mise à jour avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        candidate: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          firstName: 'Ahmed',
          lastName: 'Benali',
          school: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Medersa Al-Ihsan',
          },
        },
        center: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: "Centre d'examen Paris",
        },
        subject: 'FRANCAIS',
        score: 18,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Note non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Note non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN, UserRole.GRADER)
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une note',
    description: 'Supprimer une note donnée',
  })
  @ApiResponse({
    status: 200,
    description: 'Note supprimée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Note non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Note non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
