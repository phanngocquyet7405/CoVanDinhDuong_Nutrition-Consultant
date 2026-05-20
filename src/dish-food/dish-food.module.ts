import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DishFood } from './entities/dish-food.entity';
import { DishFoodService } from './dish-food.service';
import { DishFoodController } from './dish-food.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DishFood]),
  ],
  controllers: [DishFoodController],
  providers: [DishFoodService],
  exports: [DishFoodService],   // export để DishService dùng nếu cần
})
export class DishFoodModule { }