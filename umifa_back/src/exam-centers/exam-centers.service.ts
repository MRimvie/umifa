import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamCenterDto } from './dto/create-exam-center.dto';
import { UpdateExamCenterDto } from './dto/update-exam-center.dto';

@Injectable()
export class ExamCentersService {
  constructor(private prisma: PrismaService) {}

  async create(createExamCenterDto: CreateExamCenterDto) {
    return this.prisma.examCenter.create({
      data: createExamCenterDto,
    });
  }

  async findAll() {
    return this.prisma.examCenter.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const center = await this.prisma.examCenter.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    if (!center) {
      throw new NotFoundException("Centre d'examen non trouvé");
    }

    return center;
  }

  async update(id: string, updateExamCenterDto: UpdateExamCenterDto) {
    await this.findOne(id);
    return this.prisma.examCenter.update({
      where: { id },
      data: updateExamCenterDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.examCenter.delete({ where: { id } });
  }
}
