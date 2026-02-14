import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingScaleEntity } from './entities/grading-scale.entity';
import { GradingScaleRepository } from '../grading-scale.repository';
import { GradingScaleRelationalRepository } from './repositories/grading-scale.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GradingScaleEntity])],
  providers: [
    {
      provide: GradingScaleRepository,
      useClass: GradingScaleRelationalRepository,
    },
  ],
  exports: [GradingScaleRepository],
})
export class ExamsRelationalPersistenceModule {}
