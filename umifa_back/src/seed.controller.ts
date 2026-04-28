import { Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Get('status')
  @ApiOperation({ summary: 'Statut de la base de données' })
  async status() {
    const dbInfo = await this.prisma.$queryRaw<
      Array<{ current_database: string; current_schema: string }>
    >`select current_database() as current_database, current_schema() as current_schema`;

    const usersCount = await this.prisma.user.count();

    return {
      success: true,
      database: dbInfo?.[0]?.current_database,
      schema: dbInfo?.[0]?.current_schema,
      usersCount,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Créer les 3 comptes de base (admin, manager, correcteur)' })
  async seed(@Req() req: Request) {
    try {
      if (process.env.SEED_KEY && process.env.NODE_ENV === 'production') {
        const providedKey = String(req.headers['x-seed-key'] || '');
        if (!providedKey || providedKey !== process.env.SEED_KEY) {
          throw new UnauthorizedException('Seed key invalide');
        }
      }

      const adminHashed = await bcrypt.hash('admin123', 10);
      const managerHashed = await bcrypt.hash('manager123', 10);
      const graderHashed = await bcrypt.hash('correcteur123', 10);

      const superAdmin = await this.prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {
          password: adminHashed,
          firstName: 'Admin',
          lastName: 'UMIFA',
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
        create: {
          email: 'admin@gmail.com',
          password: adminHashed,
          firstName: 'Admin',
          lastName: 'UMIFA',
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      });

      const schoolManager = await this.prisma.user.upsert({
        where: { email: 'manager@gmail.com' },
        update: {
          password: managerHashed,
          firstName: 'Manager',
          lastName: 'UMIFA',
          role: UserRole.SCHOOL_MANAGER,
          isActive: true,
        },
        create: {
          email: 'manager@gmail.com',
          password: managerHashed,
          firstName: 'Manager',
          lastName: 'UMIFA',
          role: UserRole.SCHOOL_MANAGER,
          isActive: true,
        },
      });

      const grader = await this.prisma.user.upsert({
        where: { email: 'correcteur@gmail.com' },
        update: {
          password: graderHashed,
          firstName: 'Correcteur',
          lastName: 'UMIFA',
          role: UserRole.GRADER,
          isActive: true,
        },
        create: {
          email: 'correcteur@gmail.com',
          password: graderHashed,
          firstName: 'Correcteur',
          lastName: 'UMIFA',
          role: UserRole.GRADER,
          isActive: true,
        },
      });

      return {
        success: true,
        message: 'Seeding terminé avec succès',
        data: {
          superAdmin: superAdmin.email,
          schoolManager: schoolManager.email,
          grader: grader.email,
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
