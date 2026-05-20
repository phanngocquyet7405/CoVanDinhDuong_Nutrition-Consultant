import { Test, TestingModule } from '@nestjs/testing';
import { DishFoodService } from './dish-food.service';

describe('DishFoodService', () => {
  let service: DishFoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DishFoodService],
    }).compile();

    service = module.get<DishFoodService>(DishFoodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
