import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { AssignCenterDto } from './dto/assign-center.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('candidates')
@ApiBearerAuth('JWT-auth')
@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_MANAGER)
  @ApiOperation({
    summary: 'Inscrire un candidat',
    description: "Créer un nouveau candidat pour l'examen CEP Arabe",
  })
  @ApiResponse({
    status: 201,
    description: 'Candidat créé avec succès',
    schema: {
      example: {
        id: '770e8400-e29b-41d4-a716-446655440002',
        firstName: 'Ahmed',
        lastName: 'Benali',
        gender: 'MASCULIN',
        dateOfBirth: '2010-05-15T00:00:00.000Z',
        placeOfBirth: 'Manga',
        nationality: 'Burkinabè',
        numeroPV: null,
        schoolId: '550e8400-e29b-41d4-a716-446655440000',
        schoolYearId: '660e8400-e29b-41d4-a716-446655440001',
        centerId: null,
        school: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Medersa Al-Ihsan',
        },
        schoolYear: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          year: '2025-2026',
        },
      },
    },
  })
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_MANAGER)
  @ApiOperation({
    summary: 'Inscription en masse',
    description: 'Inscrire plusieurs candidats en une seule requête',
  })
  @ApiBody({
    type: [CreateCandidateDto],
    examples: {
      multipleCandidates: {
        summary: 'Exemple avec 2 candidats',
        value: [
          {
            firstName: 'Ahmed',
            lastName: 'Benali',
            gender: 'MASCULIN',
            dateOfBirth: '2010-05-15',
            placeOfBirth: 'Paris',
            nationality: 'Burkinabè',
            schoolId: '550e8400-e29b-41d4-a716-446655440000',
            schoolYearId: '660e8400-e29b-41d4-a716-446655440001',
          },
          {
            firstName: 'Fatima',
            lastName: 'Zahra',
            gender: 'FEMININ',
            dateOfBirth: '2010-08-22',
            placeOfBirth: 'Lyon',
            nationality: 'Burkinabè',
            schoolId: '550e8400-e29b-41d4-a716-446655440000',
            schoolYearId: '660e8400-e29b-41d4-a716-446655440001',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Candidats créés avec succès',
    schema: {
      example: {
        count: 2,
      },
    },
  })
  createBulk(@Body() candidates: CreateCandidateDto[]) {
    return this.candidatesService.createBulk(candidates);
  }

  @Post('assign-center')
  @ApiOperation({
    summary: 'Affecter plusieurs candidats à un centre',
    description: "Affecte plusieurs candidats à un centre d'examen donné",
  })
  @ApiResponse({
    status: 201,
    description: 'Candidats affectés avec succès',
    schema: {
      example: {
        count: 15,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Aucun candidat à affecter',
    schema: {
      example: {
        statusCode: 400,
        message: 'Aucun candidat à affecter',
        error: 'Bad Request',
      },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  assignCenter(@Body() assignCenterDto: AssignCenterDto) {
    return this.candidatesService.assignCenter(assignCenterDto);
  }

  @Post('distribute/:schoolYearId')
  @ApiOperation({
    summary: 'Répartir automatiquement les candidats',
    description: "Répartit automatiquement les candidats d'une année scolaire dans les centres actifs en respectant leur capacité",
  })
  @ApiParam({
    name: 'schoolYearId',
    description: "ID de l'année scolaire",
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 201,
    description: 'Répartition effectuée avec succès',
    schema: {
      example: { message: '120 candidat(s) réparti(s) avec succès', count: 120 },
    },
  })
  @Roles(UserRole.SUPER_ADMIN)
  distributeCandidates(@Param('schoolYearId') schoolYearId: string) {
    return this.candidatesService.distributeCandidates(schoolYearId);
  }

  @Get('distribution/:schoolYearId')
  @ApiOperation({
    summary: 'État de la répartition par centre',
    description: "Retourne le nombre de candidats affectés par centre (pour une année scolaire), les capacités et les places restantes",
  })
  @ApiParam({
    name: 'schoolYearId',
    description: "ID de l'année scolaire",
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'État de la répartition',
  })
  @Roles(UserRole.SUPER_ADMIN)
  getDistribution(@Param('schoolYearId') schoolYearId: string) {
    return this.candidatesService.getDistribution(schoolYearId);
  }

  @Post('generate-pv/:schoolYearId')
  @ApiOperation({
    summary: 'Générer mles numéros PV',
    description:
      "Génère automatiquement les numéros PV pour tous les candidats d'une année scolaire (format: 2026001, 2026002, etc.)",
  })
  @ApiResponse({
    status: 201,
    description: 'Numéros PV générés avec succès',
    schema: {
      example: {
        message: '15 numéros PV générés avec succès',
        count: 15,
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
  @ApiOperation({
    summary: 'Générer les numéros PV',
    description:
      "Génère automatiquement les numéros PV pour tous les candidats d'une année scolaire (format: 2026001, 2026002, etc.)",
  })
  @ApiParam({
    name: 'schoolYearId',
    description: "ID de l'année scolaire",
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 201,
    description: 'Numéros PV générés avec succès',
    schema: {
      example: {
        message: '15 numéros PV générés avec succès',
        count: 15,
      },
    },
  })
  generateNumeroPV(@Param('schoolYearId') schoolYearId: string) {
    return this.candidatesService.generateNumeroPV(schoolYearId);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des candidats',
    description: 'Récupérer tous les candidats avec filtres optionnels',
  })
  @ApiQuery({ name: 'schoolYearId', required: false, description: 'Filtrer par année scolaire' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filtrer par école' })
  @ApiQuery({ name: 'centerId', required: false, description: "Filtrer par centre d'examen" })
  @ApiResponse({
    status: 200,
    description: 'Liste des candidats récupérée avec succès',
    schema: {
      example: [
        {
          id: '770e8400-e29b-41d4-a716-446655440002',
          firstName: 'Ahmed',
          lastName: 'Benali',
          gender: 'MASCULIN',
          dateOfBirth: '2010-05-15T00:00:00.000Z',
          placeOfBirth: 'Manga',
          nationality: 'Burkinabè',
          numeroPV: '2026001',
          school: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Medersa Al-Ihsan',
          },
          schoolYear: {
            id: '660e8400-e29b-41d4-a716-446655440001',
            year: '2025-2026',
          },
          center: {
            id: '880e8400-e29b-41d4-a716-446655440003',
            name: 'Centre Paris Nord',
          },
        },
      ],
    },
  })
  findAll(
    @Query('schoolYearId') schoolYearId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.candidatesService.findAll(schoolYearId, schoolId, centerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un candidat",
    description: "Récupère les détails complets d'un candidat",
  })
  @ApiResponse({
    status: 200,
    description: 'Détail du candidat récupéré avec succès',
    schema: {
      example: {
        id: '770e8400-e29b-41d4-a716-446655440002',
        firstName: 'Ahmed',
        lastName: 'Benali',
        gender: 'MASCULIN',
        dateOfBirth: '2010-05-15T00:00:00.000Z',
        placeOfBirth: 'Paris',
        nationality: 'Burkinabè',
        numeroPV: '2026001',
        school: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Medersa Al-Ihsan',
        },
        schoolYear: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          year: '2025-2026',
        },
        center: {
          id: '880e8400-e29b-41d4-a716-446655440003',
          name: 'Centre Paris Nord',
        },
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
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un candidat',
    description: "Modifie les informations d'un candidat donné",
  })
  @ApiResponse({
    status: 200,
    description: 'Candidat mis à jour avec succès',
    schema: {
      example: {
        id: '770e8400-e29b-41d4-a716-446655440002',
        firstName: 'Ahmed',
        lastName: 'Benali',
        gender: 'MASCULIN',
        dateOfBirth: '2010-05-15T00:00:00.000Z',
        placeOfBirth: 'Paris',
        nationality: 'Burkinabè',
        numeroPV: '2026001',
        school: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Medersa Al-Ihsan',
        },
        schoolYear: {
          id: '660e8400-e29b-41d4-a716-446655440001',
          year: '2025-2026',
        },
        center: {
          id: '880e8400-e29b-41d4-a716-446655440003',
          name: 'Centre Paris Nord',
        },
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_MANAGER)
  update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un candidat',
    description: 'Supprime un candidat donné',
  })
  @ApiResponse({
    status: 200,
    description: 'Candidat supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Candidat non trouvé',
  })
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}
