import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddFoodDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    foodId: number;

    /**
     * Số lượng theo đơn vị của food
     * Ví dụ: food.unit = '100g', quantity = 1.5 → 150g
     */
    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    quantity: number;
}