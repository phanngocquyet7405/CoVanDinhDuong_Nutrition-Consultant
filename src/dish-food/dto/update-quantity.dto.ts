import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuantityDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    quantity: number;
}