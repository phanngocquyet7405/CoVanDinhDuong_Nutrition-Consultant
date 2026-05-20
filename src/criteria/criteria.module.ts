import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Criteria } from './entities/criterion.entity';

import { CriteriaController } from './criteria.controller';
import { CriteriaService } from './criteria.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Criteria
    ])
  ],

  controllers: [
    CriteriaController
  ],

  providers: [
    CriteriaService
  ],

  exports: [
    CriteriaService
  ]
})
export class CriteriaModule { }