import { Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRole, SchoolYearStatus, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async seed() {
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const superAdmin = await this.prisma.user.upsert({
        where: { email: 'admin@umifa.fr' },
        update: {},
        create: {
          email: 'admin@umifa.fr',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'UMIFA',
          role: UserRole.SUPER_ADMIN,
        },
      });

      const school1 = await this.prisma.school.upsert({
        where: { name: 'Medersa Al-Ihsan' },
        update: {},
        create: {
          name: 'Medersa Al-Ihsan',
          address: '123 Rue de la Paix, Paris',
          phone: '01 23 45 67 89',
          email: 'contact@alihsan.fr',
          contactName: 'Directeur Al-Ihsan',
        },
      });

      const school2 = await this.prisma.school.upsert({
        where: { name: 'Medersa An-Nour' },
        update: {},
        create: {
          name: 'Medersa An-Nour',
          address: '456 Avenue des Lumières, Lyon',
          phone: '04 56 78 90 12',
          email: 'contact@annour.fr',
          contactName: 'Directeur An-Nour',
        },
      });

      const schoolYear = await this.prisma.schoolYear.upsert({
        where: { year: '2025-2026' },
        update: {},
        create: {
          year: '2025-2026',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2026-06-30'),
          status: SchoolYearStatus.INSCRIPTION,
          isActive: true,
        },
      });

      const center1 = await this.prisma.examCenter.create({
        data: {
          name: 'Centre Paris Nord',
          address: '789 Boulevard du Nord, Paris',
          capacity: 100,
          phone: '01 98 76 54 32',
        },
      });

      const center2 = await this.prisma.examCenter.create({
        data: {
          name: 'Centre Lyon Sud',
          address: '321 Rue du Sud, Lyon',
          capacity: 80,
          phone: '04 12 34 56 78',
        },
      });

      const schoolManager = await this.prisma.user.create({
        data: {
          email: 'manager@alihsan.fr',
          password: hashedPassword,
          firstName: 'Responsable',
          lastName: 'Al-Ihsan',
          role: UserRole.SCHOOL_MANAGER,
          schoolId: school1.id,
        },
      });

      const grader = await this.prisma.user.create({
        data: {
          email: 'grader@umifa.fr',
          password: hashedPassword,
          firstName: 'Correcteur',
          lastName: 'Paris',
          role: UserRole.GRADER,
          centerId: center1.id,
        },
      });

      const candidate1 = await this.prisma.candidate.create({
        data: {
          firstName: 'Ahmed',
          lastName: 'Benali',
          gender: Gender.MASCULIN,
          dateOfBirth: new Date('2010-05-15'),
          placeOfBirth: 'Paris',
          nationality: 'Française',
          schoolId: school1.id,
          schoolYearId: schoolYear.id,
        },
      });

      const candidate2 = await this.prisma.candidate.create({
        data: {
          firstName: 'Fatima',
          lastName: 'Zahra',
          gender: Gender.FEMININ,
          dateOfBirth: new Date('2010-08-22'),
          placeOfBirth: 'Lyon',
          nationality: 'Française',
          schoolId: school2.id,
          schoolYearId: schoolYear.id,
        },
      });

      return {
        success: true,
        message: 'Seeding terminé avec succès',
        data: {
          superAdmin: superAdmin.email,
          schoolManager: schoolManager.email,
          grader: grader.email,
          schools: [school1.name, school2.name],
          centers: [center1.name, center2.name],
          candidates: [candidate1.firstName, candidate2.firstName],
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du seeding',
        error: error.message,
      };
    }
  }
}
