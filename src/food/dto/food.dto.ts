import { Expose } from 'class-transformer';

export class FoodDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    calories: number;

    @Expose()
    protein: number;

    @Expose()
    carbs: number;

    @Expose()
    fat: number;

    @Expose()
    cost: number;
}