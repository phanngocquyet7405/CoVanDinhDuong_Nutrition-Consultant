import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodDto } from './create-food.dto';

/**
 * Tất cả field của CreateFoodDto trở thành optional
 * → PATCH /food/:id chỉ cần gửi field muốn cập nhật
 */
export class UpdateFoodDto extends PartialType(CreateFoodDto) { }