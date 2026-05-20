import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DishFoodService } from './dish-food.service';
import { AddFoodDto } from './dto/add-food.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

/**
 * Route lồng dưới /dish/:dishId/foods
 * Quản lý nguyên liệu của một món ăn cụ thể
 */
@Controller('dish/:dishId/foods')
export class DishFoodController {
  constructor(private readonly dishFoodService: DishFoodService) { }

  /**
   * GET /dish/:dishId/foods
   * Lấy danh sách nguyên liệu kèm thông tin dinh dưỡng đã tính
   */
  @Get()
  findAll(@Param('dishId', ParseIntPipe) dishId: number) {
    return this.dishFoodService.findByDish(dishId);
  }

  /**
   * POST /dish/:dishId/foods
   * Thêm nguyên liệu vào món ăn
   * Body: { foodId: number, quantity: number }
   */
  @Post()
  addFood(
    @Param('dishId', ParseIntPipe) dishId: number,
    @Body() dto: AddFoodDto,
  ) {
    return this.dishFoodService.addFood(dishId, dto.foodId, dto.quantity);
  }

  /**
   * PATCH /dish/:dishId/foods/:dishFoodId
   * Cập nhật số lượng nguyên liệu
   * Body: { quantity: number }
   */
  @Patch(':dishFoodId')
  updateQuantity(
    @Param('dishId', ParseIntPipe) dishId: number,
    @Param('dishFoodId', ParseIntPipe) dishFoodId: number,
    @Body() dto: UpdateQuantityDto,
  ) {
    return this.dishFoodService.updateQuantity(dishFoodId, dishId, dto.quantity);
  }

  /**
   * DELETE /dish/:dishId/foods/:dishFoodId
   * Xóa một nguyên liệu khỏi món ăn
   */
  @Delete(':dishFoodId')
  removeFood(
    @Param('dishId', ParseIntPipe) dishId: number,
    @Param('dishFoodId', ParseIntPipe) dishFoodId: number,
  ) {
    return this.dishFoodService.removeFood(dishFoodId, dishId);
  }
}