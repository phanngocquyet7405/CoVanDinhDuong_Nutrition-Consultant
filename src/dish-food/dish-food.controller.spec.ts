import { Test, TestingModule } from '@nestjs/testing';
import { DishFoodController } from './dish-food.controller';
import { DishFoodService } from './dish-food.service';

describe('DishFoodController', () => {
  let controller: DishFoodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishFoodController],
      providers: [DishFoodService],
    }).compile();

    controller = module.get<DishFoodController>(DishFoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
