import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishFood } from './entities/dish-food.entity';

@Injectable()
export class DishFoodService {
    constructor(
        @InjectRepository(DishFood)
        private dishFoodRepository: Repository<DishFood>,
    ) { }

    /**
     * Lấy tất cả nguyên liệu của một dish kèm thông tin food
     * GET /dish/:dishId/foods
     */
    async findByDish(dishId: number) {
        const items = await this.dishFoodRepository.find({
            where: { dish: { id: dishId } },
            relations: { food: true },
            order: { id: 'ASC' },
        });

        return items.map(df => ({
            id: df.id,
            quantity: df.quantity,
            food: {
                id: df.food.id,
                name: df.food.name,
                category: df.food.category,
                unit: df.food.unit,
                calories: df.food.calories,
                protein: df.food.protein,
                carbs: df.food.carbs,
                fat: df.food.fat,
                cost: df.food.cost,
            },
            // Dinh dưỡng đã nhân quantity — tiện cho UI hiển thị
            computed: {
                calories: Math.round(df.food.calories * df.quantity * 10) / 10,
                protein: Math.round(df.food.protein * df.quantity * 10) / 10,
                carbs: Math.round(df.food.carbs * df.quantity * 10) / 10,
                fat: Math.round(df.food.fat * df.quantity * 10) / 10,
                cost: Math.round(df.food.cost * df.quantity),
            },
        }));
    }

    /**
     * Thêm một nguyên liệu vào dish
     * POST /dish/:dishId/foods  { foodId, quantity }
     *
     * Nếu food đã có trong dish → cộng dồn quantity thay vì tạo row mới
     */
    async addFood(dishId: number, foodId: number, quantity: number) {
        const existing = await this.dishFoodRepository.findOne({
            where: {
                dish: { id: dishId },
                food: { id: foodId },
            },
        });

        if (existing) {
            // Cộng dồn quantity
            existing.quantity = Math.round((existing.quantity + quantity) * 100) / 100;
            return this.dishFoodRepository.save(existing);
        }

        const entry = this.dishFoodRepository.create({
            dish: { id: dishId } as any,
            food: { id: foodId } as any,
            quantity,
        });

        return this.dishFoodRepository.save(entry);
    }

    /**
     * Cập nhật quantity của một nguyên liệu
     * PATCH /dish/:dishId/foods/:dishFoodId  { quantity }
     */
    async updateQuantity(dishFoodId: number, dishId: number, quantity: number) {
        const entry = await this.dishFoodRepository.findOne({
            where: { id: dishFoodId, dish: { id: dishId } },
        });

        if (!entry) {
            throw new NotFoundException(
                `Không tìm thấy nguyên liệu id=${dishFoodId} trong dish id=${dishId}`,
            );
        }

        entry.quantity = quantity;
        return this.dishFoodRepository.save(entry);
    }

    /**
     * Xóa một nguyên liệu khỏi dish
     * DELETE /dish/:dishId/foods/:dishFoodId
     */
    async removeFood(dishFoodId: number, dishId: number) {
        const entry = await this.dishFoodRepository.findOne({
            where: { id: dishFoodId, dish: { id: dishId } },
        });

        if (!entry) {
            throw new NotFoundException(
                `Không tìm thấy nguyên liệu id=${dishFoodId} trong dish id=${dishId}`,
            );
        }

        return this.dishFoodRepository.remove(entry);
    }

    /**
     * Xóa toàn bộ nguyên liệu của một dish
     * Dùng nội bộ khi xóa dish hoặc reset
     */
    async removeAllByDish(dishId: number) {
        return this.dishFoodRepository.delete({ dish: { id: dishId } });
    }
}