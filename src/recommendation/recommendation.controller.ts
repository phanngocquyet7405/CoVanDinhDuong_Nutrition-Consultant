import { Controller, Get } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommend')
export class RecommendationController {
    constructor(private service: RecommendationService) { }

    /**
     * GET /recommend
     * Trả về toàn bộ kết quả AHP + TOPSIS:
     * - criteria[]: thông tin tiêu chí + weight đã normalize
     * - recommendations[]: danh sách dish đã sắp xếp theo score giảm dần
     *
     * Dùng cho Recommend.tsx và Dashboard.tsx (merge score vào dish list)
     */
    @Get()
    recommend() {
        return this.service.recommend();
    }

    /**
     * GET /recommend/ranked
     * Trả về chỉ mảng dishes đã có score — dạng gọn cho Dashboard
     * Response: { id, name, score, calories, protein, fat, cost }[]
     */
    @Get('ranked')
    ranked() {
        return this.service.getRankedDishes();
    }
}