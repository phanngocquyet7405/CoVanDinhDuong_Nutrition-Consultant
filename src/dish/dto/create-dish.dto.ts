import {
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
    MaxLength,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Một nguyên liệu kèm số lượng khi tạo dish
 * Dùng trong POST /dish body: { name, description, ingredients: [...] }
 */
export class DishIngredientDto {
    @IsNumber()
    @Min(1)
    foodId: number;

    /**
     * Số lượng theo đơn vị của food (ví dụ: 2 = 200g nếu unit là 100g)
     */
    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    quantity: number;
}

export class CreateDishDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    /**
     * Danh sách nguyên liệu — optional khi tạo mới
     * Có thể thêm nguyên liệu sau qua POST /dish/:id/foods
     */
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => DishIngredientDto)
    ingredients?: DishIngredientDto[];
}