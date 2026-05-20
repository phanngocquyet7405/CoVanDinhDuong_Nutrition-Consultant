import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criteria } from './entities/criterion.entity';

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(Criteria)
    private criteriaRepository: Repository<Criteria>,
  ) { }

  async create(createDto: any) {
    const criteria = this.criteriaRepository.create(createDto);
    return await this.criteriaRepository.save(criteria);
  }

  /**
   * Dùng cho API trả về UI:
   * - type được capitalize: 'benefit' → 'Benefit', 'cost' → 'Cost'
   * - Khớp với check `c.type === "Benefit"` trong Criteria.tsx
   */
  async findAll() {
    const list = await this.criteriaRepository.find({
      order: { id: 'ASC' },
    });

    return list.map(c => ({
      ...c,
      type: (c.type.charAt(0).toUpperCase() + c.type.slice(1)) as 'Benefit' | 'Cost',
    }));
  }

  /**
   * Dùng nội bộ trong RecommendationService:
   * - Giữ nguyên type lowercase ('benefit' | 'cost')
   * - Đúng format mà TopsisService.rank() cần
   */
  async findAllRaw(): Promise<Criteria[]> {
    return this.criteriaRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.criteriaRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: any) {
    await this.criteriaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.criteriaRepository.delete(id);
  }
}