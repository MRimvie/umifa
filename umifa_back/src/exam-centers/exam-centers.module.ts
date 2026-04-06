import { Module } from '@nestjs/common';
import { ExamCentersService } from './exam-centers.service';
import { ExamCentersController } from './exam-centers.controller';

@Module({
  providers: [ExamCentersService],
  controllers: [ExamCentersController],
  exports: [ExamCentersService],
})
export class ExamCentersModule {}
