import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { ExamCentersModule } from './exam-centers/exam-centers.module';
import { CandidatesModule } from './candidates/candidates.module';
import { GradesModule } from './grades/grades.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SeedController } from './seed.controller';
import { MigrateController } from './migrate.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    SchoolYearsModule,
    ExamCentersModule,
    CandidatesModule,
    GradesModule,
    SubjectsModule,
  ],
  controllers: [SeedController, MigrateController],
})
export class AppModule {}
