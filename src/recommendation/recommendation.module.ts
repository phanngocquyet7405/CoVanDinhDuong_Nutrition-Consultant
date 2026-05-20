import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { AhpModule } from '../ahp/ahp.module';
import { TopsisModule } from '../topsis/topsis.module';
import { CriteriaModule } from '../criteria/criteria.module';  // ← thêm
import { Dish } from '../dish/entities/dish.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish]),
    AhpModule,
    TopsisModule,
    CriteriaModule,   // ← thêm để inject CriteriaService
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule { }