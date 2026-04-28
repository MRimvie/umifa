import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(createSchoolDto: CreateSchoolDto) {
    const existing = await this.prisma.school.findUnique({
      where: { name: createSchoolDto.name },
    });

    if (existing) {
      throw new ConflictException('Une école avec ce nom existe déjà');
    }

    return this.prisma.school.create({
      data: createSchoolDto,
    });
  }

  async findAll() {
    return this.prisma.school.findMany({
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
    const school = await this.prisma.school.findUnique({
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

    if (!school) {
      throw new NotFoundException('École non trouvée');
    }

    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto) {
    await this.findOne(id);
    return this.prisma.school.update({
      where: { id },
      data: updateSchoolDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.school.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }
}
