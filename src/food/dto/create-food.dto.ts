import {
    IsString,
    IsNumber,
    IsOptional,
    IsIn,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFoodDto {
    @IsString()
    @MaxLength(255)
    name: string;

    /**
     * Phân loại — dùng để hiển thị badge màu trong Food.tsx
     * Các giá trị hợp lệ khớp với categoryColors trong UI
     */
    @IsOptional()
    @IsString()
    @IsIn(['Protein', 'Tinh bột', 'Rau củ', 'Khác'])
    category?: string;

    /**
     * Đơn vị tính — mặc định '100g'
     */
    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    calories: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    protein: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    carbs: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    fat: number;

    /**
     * Chi phí tính theo đơn vị (VNĐ)
     * Ví dụ: 5000 = 5.000đ / 100g
     */
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    cost: number;
}