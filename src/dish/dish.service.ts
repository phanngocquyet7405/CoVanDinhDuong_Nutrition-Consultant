import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { CreateDishDto } from './dto/create-dish.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) { }

  /**
   * Tạo dish mới — không gắn ingredient ở đây
   * Ingredient được gắn qua POST /dish/:id/foods
   */
  async create(createDishDto: CreateDishDto) {
    const dish = this.dishRepository.create({
      name: createDishDto.name,
      description: createDishDto.description ?? '',
    });
    return await this.dishRepository.save(dish);
  }

  /**
   * GET /dish — trả về đủ fields mà Dish.tsx và Dashboard.tsx cần:
   * - foods: string[]     → tên nguyên liệu để hiển thị badge
   * - calories, protein,
   *   carbs, fat, cost    → tính từ dish_food × quantity
   */
  async findAll() {
    const dishes = await this.dishRepository.find({
      relations: { foods: { food: true } },
      order: { id: 'ASC' },
    });

    return dishes.map(dish => this.mapDish(dish));
  }

  /**
   * GET /dish/:id — trả về một dish với đầy đủ nutrition
   */
  async findOne(id: number) {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: { foods: { food: true } },
    });

    if (!dish) throw new NotFoundException(`Không tìm thấy dish id=${id}`);

    return this.mapDish(dish);
  }

  async update(id: number, updateDishDto: any) {
    await this.dishRepository.update(id, updateDishDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.dishRepository.delete(id);
  }

  /**
   * Dùng nội bộ bởi RecommendationService — trả về raw entity với relation
   */
  async findAllWithRelations() {
    return this.dishRepository.find({
      relations: { foods: { food: true } },
      order: { id: 'ASC' },
    });
  }

  // ── Helper ───────────────────────────────────────────────────────────
  private mapDish(dish: Dish) {
    let calories = 0, protein = 0, carbs = 0, fat = 0, cost = 0;
    const foodNames: string[] = [];

    dish.foods.forEach(df => {
      const q = df.quantity;
      calories += df.food.calories * q;
      protein += df.food.protein * q;
      carbs += df.food.carbs * q;
      fat += df.food.fat * q;
      cost += df.food.cost * q;
      foodNames.push(df.food.name);
    });

    return {
      id: dish.id,
      name: dish.name,
      description: dish.description,
      foods: foodNames,
      calories: Math.round(calories * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      cost: Math.round(cost),
    };
  }
}