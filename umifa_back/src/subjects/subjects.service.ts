import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSubjectDto) {
    return (this.prisma as any).subject.create({
      data: {
        name: dto.name,
        noteMax: dto.noteMax ?? 20,
        isActive: dto.isActive ?? true,
      },
    });
  }

  findAll(includeInactive?: boolean) {
    return (this.prisma as any).subject.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await (this.prisma as any).subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException('Matière non trouvée');
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);
    return (this.prisma as any).subject.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma as any).subject.delete({ where: { id } });
  }
}
