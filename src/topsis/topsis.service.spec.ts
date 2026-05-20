import { Test, TestingModule } from '@nestjs/testing';
import { TopsisService } from './topsis.service';

describe('TopsisService', () => {
  let service: TopsisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TopsisService],
    }).compile();

    service = module.get<TopsisService>(TopsisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
