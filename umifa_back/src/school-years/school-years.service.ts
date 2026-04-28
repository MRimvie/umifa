import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';

@Injectable()
export class SchoolYearsService {
  constructor(private prisma: PrismaService) {}

  async create(createSchoolYearDto: CreateSchoolYearDto) {
    const existing = await this.prisma.schoolYear.findUnique({
      where: { year: createSchoolYearDto.year },
    });

    if (existing) {
      throw new ConflictException('Cette année scolaire existe déjà');
    }

    return this.prisma.schoolYear.create({
      data: createSchoolYearDto,
    });
  }

  async findAll() {
    return this.prisma.schoolYear.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
      },
      orderBy: {
        year: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    if (!schoolYear) {
      throw new NotFoundException('Année scolaire non trouvée');
    }

    return schoolYear;
  }

  async findActive() {
    return this.prisma.schoolYear.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, updateSchoolYearDto: UpdateSchoolYearDto) {
    await this.findOne(id);
    return this.prisma.schoolYear.update({
      where: { id },
      data: updateSchoolYearDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.schoolYear.delete({ where: { id } });
  }
}
