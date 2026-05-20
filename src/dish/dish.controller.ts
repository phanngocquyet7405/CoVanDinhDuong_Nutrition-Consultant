import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) { }

  /**
   * POST /dish
   * Tạo món ăn mới (chưa có nguyên liệu)
   * Thêm nguyên liệu qua POST /dish/:id/foods
   */
  @Post()
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  /**
   * GET /dish
   * Danh sách tất cả món ăn kèm nutrition tổng hợp
   * Dùng cho Dish.tsx và Dashboard.tsx (merge score từ /recommend)
   */
  @Get()
  findAll() {
    return this.dishService.findAll();
  }

  /**
   * GET /dish/:id
   * Chi tiết một món ăn kèm nutrition
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.findOne(id);
  }

  /**
   * PATCH /dish/:id
   * Cập nhật tên / mô tả món ăn
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
  ) {
    return this.dishService.update(id, updateDishDto);
  }

  /**
   * DELETE /dish/:id
   * Xóa món ăn (dish_food bị xóa cascade theo entity)
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.remove(id);
  }
}