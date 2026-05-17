import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * ParseIntIdPipe — Validate và convert :id param thành integer MySQL PK
 *
 * MySQL dùng integer PK (1, 2, 3...) — không phải ObjectId hex của MongoDB.
 * Pipe này đảm bảo:
 *   - Giá trị là số nguyên hợp lệ (không phải NaN, float, hoặc chuỗi rác)
 *   - Giá trị > 0 (PK bắt đầu từ 1, không âm)
 *
 * Cách dùng:
 *   @Get(':id')
 *   findOne(@Param('id', ParseIntIdPipe) id: number) { ... }
 *
 *   @Delete(':id')
 *   remove(@Param('id', ParseIntIdPipe) id: number) { ... }
 *
 * Ví dụ:
 *   '5'    → 5      ✓
 *   '0'    → throw 400 (PK không bao giờ là 0)
 *   '-1'   → throw 400
 *   'abc'  → throw 400
 *   '1.5'  → throw 400 (phải là integer)
 */
@Injectable()
export class ParseIntIdPipe implements PipeTransform<string, number> {
    transform(value: string): number {
        // parseInt bỏ qua phần thập phân → '1.5' thành 1, cần kiểm tra riêng
        if (value.includes('.')) {
            throw new BadRequestException(`ID phải là số nguyên, nhận: "${value}"`);
        }

        const id = parseInt(value, 10);

        if (isNaN(id)) {
            throw new BadRequestException(`ID không hợp lệ: "${value}" — phải là số`);
        }

        if (id <= 0) {
            throw new BadRequestException(`ID phải lớn hơn 0, nhận: ${id}`);
        }

        return id;
    }
}