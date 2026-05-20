import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Food } from './entities/food.entity';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) { }

  async create(createFoodDto: any) {
    const food = this.foodRepository.create(createFoodDto);

    return await this.foodRepository.save(food);
  }

  async findAll() {
    return await this.foodRepository.find();
  }

  async findOne(id: number) {
    return await this.foodRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateFoodDto: any) {
    await this.foodRepository.update(id, updateFoodDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.foodRepository.delete(id);
  }
}