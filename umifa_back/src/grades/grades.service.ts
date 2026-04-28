import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ExamResult } from '@prisma/client';

type CurrentUser = {
  id: string;
  email: string;
  role: string;
  centerId?: string | null;
};

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  /** Charge le noteMax configuré pour chaque matière (nom → noteMax). */
  private async getSubjectNoteMaxMap(): Promise<Map<string, number>> {
    const subjects: { name: string; noteMax: number }[] = await (this.prisma as any).subject.findMany({
      select: { name: true, noteMax: true },
    });
    return new Map(subjects.map((s) => [s.name, s.noteMax]));
  }

  /** Résout le noteMax réel d'une note : Subject.noteMax > grade.maxScore. */
  private resolveNoteMax(subjectMap: Map<string, number>, subjectName: string, fallback: number): number {
    return subjectMap.get(subjectName) ?? fallback;
  }

  async create(createGradeDto: CreateGradeDto, currentUser: CurrentUser) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: createGradeDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidat non trouvé');
    }

    if (currentUser?.role === 'GRADER') {
      if (!currentUser.centerId) {
        throw new ForbiddenException("Compte GRADER sans centre d'examen");
      }
      if (candidate.centerId !== currentUser.centerId) {
        throw new ForbiddenException("Vous ne pouvez saisir des notes que pour votre centre");
      }
    }

    const subjectMap = await this.getSubjectNoteMaxMap();
    const maxScore = this.resolveNoteMax(subjectMap, createGradeDto.subject, createGradeDto.maxScore ?? 20);

    return this.prisma.grade.create({
      data: {
        ...createGradeDto,
        maxScore,
        centerId: candidate.centerId,
      },
      include: { candidate: true },
    });
  }

  async createBulk(grades: CreateGradeDto[], currentUser: CurrentUser) {
    const candidateIds = grades.map((g) => g.candidateId);
    const [candidates, subjectMap] = await Promise.all([
      this.prisma.candidate.findMany({ where: { id: { in: candidateIds } } }),
      this.getSubjectNoteMaxMap(),
    ]);

    if (currentUser?.role === 'GRADER') {
      if (!currentUser.centerId) {
        throw new ForbiddenException("Compte GRADER sans centre d'examen");
      }
      const invalid = candidates.find((c) => c.centerId !== currentUser.centerId);
      if (invalid) {
        throw new ForbiddenException("Vous ne pouvez saisir des notes que pour votre centre");
      }
    }

    const gradesWithCenter = grades.map((grade) => {
      const candidate = candidates.find((c) => c.id === grade.candidateId);
      if (!candidate?.centerId) {
        throw new NotFoundException(`Candidat ${grade.candidateId} non affecté à un centre`);
      }
      return {
        ...grade,
        maxScore: this.resolveNoteMax(subjectMap, grade.subject, grade.maxScore ?? 20),
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
    const [grades, subjectMap] = await Promise.all([
      this.prisma.grade.findMany({ where: { candidateId } }),
      this.getSubjectNoteMaxMap(),
    ]);

    if (grades.length === 0) {
      throw new NotFoundException('Aucune note trouvée pour ce candidat');
    }

    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const divisor = grades.reduce((sum, g) => {
      const noteMax = this.resolveNoteMax(subjectMap, g.subject, g.maxScore);
      return sum + noteMax / 10;
    }, 0);
    const average = divisor > 0 ? totalScore / divisor : 0;
    const result = average >= 5 ? ExamResult.ADMIS : ExamResult.AJOURNE;

    // Corrige aussi le maxScore stocké et sauvegarde les résultats
    await Promise.all(
      grades.map((g) =>
        this.prisma.grade.update({
          where: { id: g.id },
          data: {
            maxScore: this.resolveNoteMax(subjectMap, g.subject, g.maxScore),
            totalScore,
            average,
            result,
          },
        }),
      ),
    );

    return { candidateId, totalScore, divisor, average, result, gradesCount: grades.length };
  }

  async calculateAll(schoolYearId: string, centerId?: string) {
    const candidates = await this.prisma.candidate.findMany({
      where: {
        schoolYearId,
        ...(centerId && { centerId }),
        grades: { some: {} }, // only candidates with at least one grade
      },
      select: { id: true },
    });

    const results = await Promise.all(
      candidates.map((c) => this.calculateResults(c.id)),
    );

    return {
      processed: results.length,
      admis: results.filter((r) => r.result === ExamResult.ADMIS).length,
      ajourne: results.filter((r) => r.result === ExamResult.AJOURNE).length,
    };
  }

  async getResults(schoolYearId: string, centerId?: string, schoolId?: string) {
    const [candidates, subjectMap] = await Promise.all([
      this.prisma.candidate.findMany({
        where: {
          schoolYearId,
          ...(centerId && { centerId }),
          ...(schoolId && { schoolId }),
        },
        include: {
          school: { select: { id: true, name: true } },
          center: { select: { id: true, name: true } },
          grades: { orderBy: { subject: 'asc' } },
        },
        orderBy: { numeroPV: 'asc' },
      }),
      this.getSubjectNoteMaxMap(),
    ]);

    return candidates.map((candidate) => {
      const grades = candidate.grades;
      if (!grades.length) {
        return {
          candidateId: candidate.id,
          numeroPV: candidate.numeroPV,
          lastName: candidate.lastName,
          firstName: candidate.firstName,
          gender: candidate.gender,
          school: candidate.school,
          center: candidate.center,
          grades: [],
          totalScore: null,
          divisor: null,
          average: null,
          result: 'EN_ATTENTE',
          gradesCount: 0,
        };
      }

      const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
      const divisor = grades.reduce((sum, g) => {
        const noteMax = this.resolveNoteMax(subjectMap, g.subject, g.maxScore);
        return sum + noteMax / 10;
      }, 0);
      const average = divisor > 0 ? totalScore / divisor : 0;
      const result = average >= 5 ? 'ADMIS' : 'AJOURNE';

      return {
        candidateId: candidate.id,
        numeroPV: candidate.numeroPV,
        lastName: candidate.lastName,
        firstName: candidate.firstName,
        gender: candidate.gender,
        school: candidate.school,
        center: candidate.center,
        grades: grades.map((g) => ({
          subject: g.subject,
          score: g.score,
          maxScore: this.resolveNoteMax(subjectMap, g.subject, g.maxScore),
        })),
        totalScore,
        divisor,
        average,
        result,
        gradesCount: grades.length,
      };
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.grade.delete({ where: { id } });
  }
}
