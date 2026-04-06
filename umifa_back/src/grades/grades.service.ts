import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ExamResult } from '@prisma/client';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(createGradeDto: CreateGradeDto) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: createGradeDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidat non trouvé');
    }

    if (!candidate.centerId) {
      throw new NotFoundException("Le candidat n'est pas affecté à un centre");
    }

    return this.prisma.grade.create({
      data: {
        ...createGradeDto,
        centerId: candidate.centerId,
      },
      include: {
        candidate: true,
      },
    });
  }

  async createBulk(grades: CreateGradeDto[]) {
    const candidateIds = grades.map((g) => g.candidateId);
    const candidates = await this.prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
    });

    const gradesWithCenter = grades.map((grade) => {
      const candidate = candidates.find((c) => c.id === grade.candidateId);
      if (!candidate?.centerId) {
        throw new NotFoundException(`Candidat ${grade.candidateId} non affecté à un centre`);
      }
      return {
        ...grade,
        centerId: candidate.centerId,
      };
    });

    return this.prisma.grade.createMany({
      data: gradesWithCenter,
      skipDuplicates: true,
    });
  }

  async findAll(candidateId?: string, centerId?: string) {
    return this.prisma.grade.findMany({
      where: {
        ...(candidateId && { candidateId }),
        ...(centerId && { centerId }),
      },
      include: {
        candidate: {
          include: {
            school: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      include: {
        candidate: true,
        center: true,
      },
    });

    if (!grade) {
      throw new NotFoundException('Note non trouvée');
    }

    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto) {
    await this.findOne(id);
    return this.prisma.grade.update({
      where: { id },
      data: updateGradeDto,
      include: {
        candidate: true,
      },
    });
  }

  async calculateResults(candidateId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { candidateId },
    });

    if (grades.length === 0) {
      throw new NotFoundException('Aucune note trouvée pour ce candidat');
    }

    const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
    const average = totalScore / grades.length;
    const result = average >= 10 ? ExamResult.ADMIS : ExamResult.AJOURNE;

    await this.prisma.grade.updateMany({
      where: { candidateId },
      data: {
        totalScore,
        average,
        result,
      },
    });

    return {
      candidateId,
      totalScore,
      average,
      result,
      gradesCount: grades.length,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.grade.delete({ where: { id } });
  }
}
