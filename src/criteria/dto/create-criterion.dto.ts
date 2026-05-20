import {
    IsString,
    IsOptional,
    IsIn,
    IsNumber,
    Min,
    Max,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCriterionDto {
    @IsString()
    @MaxLength(255)
    name: string;

    /**
     * Loại tiêu chí — phải khớp với enum trong entity
     * 'benefit' = càng cao càng tốt
     * 'cost'    = càng thấp càng tốt
     */
    @IsIn(['benefit', 'cost'])
    type: 'benefit' | 'cost';

    /**
     * Trọng số thô — sẽ được normalize khi tính toán
     * Ví dụ: calories=5, protein=4, cost=6 → tổng 20 → tỉ lệ 25%, 20%, 30%
     */
    @Type(() => Number)
    @IsNumber()
    @Min(0.1)
    @Max(100)
    weight: number;

    @IsOptional()
    @IsString()
    description?: string;

    /**
     * Màu hex — VD: '#f59e0b'
     */
    @IsOptional()
    @IsString()
    @MaxLength(20)
    color?: string;

    /**
     * Emoji icon — VD: '🔥'
     */
    @IsOptional()
    @IsString()
    @MaxLength(10)
    emoji?: string;
}