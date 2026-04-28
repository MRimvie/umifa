import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { AssignCenterDto } from './dto/assign-center.dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  private computeNextPvCounter(yearPrefix: string, existing: Array<{ numeroPV: string | null }>): number {
    let maxCounter = 0;
    for (const row of existing) {
      const pv = row.numeroPV;
      if (!pv) continue;
      if (!pv.startsWith(yearPrefix)) continue;

      const suffix = pv.substring(yearPrefix.length);
      const parsed = Number.parseInt(suffix, 10);
      if (Number.isFinite(parsed)) {
        maxCounter = Math.max(maxCounter, parsed);
      }
    }
    return maxCounter + 1;
  }

  async create(createCandidateDto: CreateCandidateDto) {
    return this.prisma.candidate.create({
      data: {
        ...createCandidateDto,
        dateOfBirth: new Date(createCandidateDto.dateOfBirth).toISOString(),
      },
      include: {
        school: true,
        schoolYear: true,
      },
    });
  }

  async createBulk(candidates: CreateCandidateDto[]) {
    return this.prisma.candidate.createMany({
      data: candidates.map(c => ({
        ...c,
        dateOfBirth: new Date(c.dateOfBirth).toISOString(),
      })),
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
    
    const data = { ...updateCandidateDto };
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
    }
    
    return this.prisma.candidate.update({
      where: { id },
      data,
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

  async distributeCandidates(schoolYearId: string) {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
    });

    if (!schoolYear) {
      throw new NotFoundException('Année scolaire non trouvée');
    }

    const centers = await this.prisma.examCenter.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    if (centers.length === 0) {
      throw new BadRequestException("Aucun centre d'examen disponible");
    }

    const candidates = await this.prisma.candidate.findMany({
      where: {
        schoolYearId,
        centerId: null,
      },
      orderBy: [{ schoolId: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    });

    if (candidates.length === 0) {
      return { message: 'Aucun candidat à répartir', count: 0 };
    }

    const countsByCenter = await this.prisma.candidate.groupBy({
      by: ['centerId'],
      where: {
        schoolYearId,
        centerId: { not: null },
      },
      _count: { _all: true },
    });

    const assignedCountMap = new Map<string, number>();
    for (const row of countsByCenter) {
      if (row.centerId) assignedCountMap.set(row.centerId, row._count._all);
    }

    const centerSlots = centers
      .map((c) => {
        const already = assignedCountMap.get(c.id) ?? 0;
        const remaining = c.capacity > 0 ? Math.max(c.capacity - already, 0) : Number.MAX_SAFE_INTEGER;
        return { id: c.id, name: c.name, remaining };
      })
      .filter((c) => c.remaining > 0);

    const totalSlots = centerSlots.reduce((sum, c) => sum + c.remaining, 0);
    if (totalSlots < candidates.length) {
      throw new BadRequestException(
        `Capacité insuffisante: ${candidates.length} candidat(s) à répartir pour ${totalSlots} place(s) restante(s).`,
      );
    }

    const centersById = new Map(centers.map((c) => [c.id, c] as const));

    let centerIndex = 0;
    const assignments: Array<{
      candidate: { id: string; firstName: string; lastName: string };
      center: { id: string; name: string };
    }> = [];

    const updates = candidates.map((candidate) => {
      while (centerSlots[centerIndex].remaining <= 0) {
        centerIndex = (centerIndex + 1) % centerSlots.length;
      }
      const chosen = centerSlots[centerIndex];
      chosen.remaining -= 1;
      centerIndex = (centerIndex + 1) % centerSlots.length;

      const center = centersById.get(chosen.id);
      if (center) {
        assignments.push({
          candidate: { id: candidate.id, firstName: candidate.firstName, lastName: candidate.lastName },
          center: { id: center.id, name: center.name },
        });
      }

      return this.prisma.candidate.update({
        where: { id: candidate.id },
        data: { centerId: chosen.id },
      });
    });

    await this.prisma.$transaction(updates);

    return {
      message: `${candidates.length} candidat(s) réparti(s) avec succès`,
      count: candidates.length,
      assignments,
    };
  }

  async getDistribution(schoolYearId: string) {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
      select: { id: true, year: true },
    });

    if (!schoolYear) {
      throw new NotFoundException('Année scolaire non trouvée');
    }

    const centers = await this.prisma.examCenter.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        capacity: true,
      },
    });

    const assignedByCenter = await this.prisma.candidate.groupBy({
      by: ['centerId'],
      where: {
        schoolYearId,
        centerId: { not: null },
      },
      _count: { _all: true },
    });

    const assignedMap = new Map<string, number>();
    for (const row of assignedByCenter) {
      if (row.centerId) assignedMap.set(row.centerId, row._count._all);
    }

    const unassignedCount = await this.prisma.candidate.count({
      where: { schoolYearId, centerId: null },
    });

    const missingPvCount = await this.prisma.candidate.count({
      where: { schoolYearId, centerId: { not: null }, numeroPV: null },
    });

    const items = centers.map((c) => {
      const assigned = assignedMap.get(c.id) ?? 0;
      const remaining = c.capacity > 0 ? Math.max(c.capacity - assigned, 0) : null;
      return {
        id: c.id,
        name: c.name,
        capacity: c.capacity,
        assigned,
        remaining,
      };
    });

    return {
      schoolYear,
      unassignedCount,
      missingPvCount,
      centers: items,
    };
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
        centerId: { not: null },
      },
      orderBy: [{ center: { name: 'asc' } }, { lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (candidates.length === 0) {
      const unassignedWithoutPv = await this.prisma.candidate.count({
        where: {
          schoolYearId,
          numeroPV: null,
          centerId: null,
        },
      });
      if (unassignedWithoutPv > 0) {
        throw new BadRequestException(
          `Aucun candidat affecté à un centre sans numéro PV trouvé. (${unassignedWithoutPv} candidat(s) sans PV ne sont pas encore affectés à un centre)`,
        );
      }
      throw new BadRequestException('Aucun candidat sans numéro PV trouvé');
    }

    const year = schoolYear.year.split('-')[0];

    const existingPVs = await this.prisma.candidate.findMany({
      where: {
        schoolYearId,
        numeroPV: { not: null, startsWith: year },
      },
      select: { numeroPV: true },
    });

    let counter = this.computeNextPvCounter(year, existingPVs);

    const pvAssignments: Array<{ candidate: { id: string; firstName: string; lastName: string }; numeroPV: string }> = [];

    const updates = candidates.map((candidate) => {
      const numeroPV = `${year}${counter.toString().padStart(3, '0')}`;
      counter++;

      pvAssignments.push({
        candidate: { id: candidate.id, firstName: candidate.firstName, lastName: candidate.lastName },
        numeroPV,
      });

      return this.prisma.candidate.update({
        where: { id: candidate.id },
        data: { numeroPV },
      });
    });

    await this.prisma.$transaction(updates);

    return {
      message: `${candidates.length} numéros PV générés avec succès`,
      count: candidates.length,
      pvAssignments,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.candidate.delete({ where: { id } });
  }
}
