import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Dish } from './entities/dish.entity';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish]),
  ],
  controllers: [DishController],
  providers: [DishService],
  exports: [DishService],
})
export class DishModule { }