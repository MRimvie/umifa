import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { AssignCenterDto } from './dto/assign-center.dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async create(createCandidateDto: CreateCandidateDto) {
    return this.prisma.candidate.create({
      data: createCandidateDto,
      include: {
        school: true,
        schoolYear: true,
      },
    });
  }

  async createBulk(candidates: CreateCandidateDto[]) {
    return this.prisma.candidate.createMany({
      data: candidates,
      skipDuplicates: true,
    });
  }

  async findAll(schoolYearId?: string, schoolId?: string, centerId?: string) {
    return this.prisma.candidate.findMany({
      where: {
        ...(schoolYearId && { schoolYearId }),
        ...(schoolId && { schoolId }),
        ...(centerId && { centerId }),
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        schoolYear: {
          select: {
            id: true,
            year: true,
          },
        },
        center: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        school: true,
        schoolYear: true,
        center: true,
        grades: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidat non trouvé');
    }

    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    await this.findOne(id);
    return this.prisma.candidate.update({
      where: { id },
      data: updateCandidateDto,
      include: {
        school: true,
        schoolYear: true,
        center: true,
      },
    });
  }

  async assignCenter(assignCenterDto: AssignCenterDto) {
    const { candidateIds, centerId } = assignCenterDto;

    const center = await this.prisma.examCenter.findUnique({
      where: { id: centerId },
    });

    if (!center) {
      throw new NotFoundException("Centre d'examen non trouvé");
    }

    return this.prisma.candidate.updateMany({
      where: {
        id: { in: candidateIds },
      },
      data: {
        centerId,
      },
    });
  }

  async generateNumeroPV(schoolYearId: string) {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
    });

    if (!schoolYear) {
      throw new NotFoundException('Année scolaire non trouvée');
    }

    const candidates = await this.prisma.candidate.findMany({
      where: {
        schoolYearId,
        numeroPV: null,
      },
      orderBy: [{ center: { name: 'asc' } }, { lastName: 'asc' }, { firstName: 'asc' }],
    });

    if (candidates.length === 0) {
      throw new BadRequestException('Aucun candidat sans numéro PV trouvé');
    }

    const year = schoolYear.year.split('-')[0];
    let counter = 1;

    const existingPVs = await this.prisma.candidate.findMany({
      where: {
        schoolYearId,
        numeroPV: { not: null },
      },
      select: { numeroPV: true },
    });

    if (existingPVs.length > 0) {
      const maxPV = Math.max(...existingPVs.map((c) => parseInt(c.numeroPV.slice(-3))));
      counter = maxPV + 1;
    }

    const updates = candidates.map((candidate) => {
      const numeroPV = `${year}${counter.toString().padStart(3, '0')}`;
      counter++;
      return this.prisma.candidate.update({
        where: { id: candidate.id },
        data: { numeroPV },
      });
    });

    await this.prisma.$transaction(updates);

    return {
      message: `${candidates.length} numéros PV générés avec succès`,
      count: candidates.length,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.candidate.delete({ where: { id } });
  }
}
