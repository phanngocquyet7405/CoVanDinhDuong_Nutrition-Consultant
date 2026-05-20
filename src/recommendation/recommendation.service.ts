import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AhpService } from '../ahp/ahp.service';
import { TopsisService } from '../topsis/topsis.service';
import { CriteriaService } from '../criteria/criteria.service';
import { Dish } from '../dish/entities/dish.entity';

@Injectable()
export class RecommendationService {
    constructor(
        private ahp: AhpService,
        private topsis: TopsisService,
        private criteriaService: CriteriaService,
        @InjectRepository(Dish)
        private dishRepository: Repository<Dish>,
    ) { }

    // ── Core: build toàn bộ kết quả AHP + TOPSIS ──────────────────────

    async recommend() {
        const { criteria, weights, criteriaTypes, dishData, scores } =
            await this.compute();

        const recommendations = dishData
            .map((dish, i) => ({
                id: dish.id,
                name: dish.name,
                score: Math.round(scores[i] * 1000) / 1000,
                details: dish.details,
            }))
            .sort((a, b) => b.score - a.score);

        return {
            // Thông tin tiêu chí để Recommend.tsx / Criteria.tsx hiển thị
            criteria: criteria.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                weight: Math.round(weights[i] * 1000) / 1000,
                rawWeight: c.weight,
                description: c.description,
                color: c.color,
                emoji: c.emoji,
            })),
            recommendations,
        };
    }

    /**
     * GET /recommend/ranked — gọn hơn cho Dashboard
     * Trả về dishes đã merge score + nutrition, sort theo score
     */
    async getRankedDishes() {
        const { dishData, scores } = await this.compute();

        return dishData
            .map((dish, i) => ({
                id: dish.id,
                name: dish.name,
                score: Math.round(scores[i] * 1000) / 1000,
                calories: Math.round(dish.details.calories * 10) / 10,
                protein: Math.round(dish.details.protein * 10) / 10,
                carbs: Math.round(dish.details.carbs * 10) / 10,
                fat: Math.round(dish.details.fat * 10) / 10,
                cost: Math.round(dish.details.cost),
            }))
            .sort((a, b) => b.score - a.score);
    }

    // ── Private: logic tính toán dùng chung ───────────────────────────

    private async compute() {
        // 1. Criteria từ DB
        const criteria = await this.criteriaService.findAllRaw();

        if (!criteria.length) {
            throw new Error('Chưa có tiêu chí nào trong hệ thống.');
        }

        // 2. Normalize weight
        const rawWeights = criteria.map(c => c.weight);
        const totalWeight = rawWeights.reduce((a, b) => a + b, 0) || 1;
        const weights = rawWeights.map(w => w / totalWeight);
        const criteriaTypes = criteria.map(c => c.type);

        // 3. Build decision matrix
        const dishes = await this.dishRepository.find({
            relations: { foods: { food: true } },
            order: { id: 'ASC' },
        });

        if (!dishes.length) {
            throw new Error('Không có dữ liệu món ăn để gợi ý.');
        }

        const dishData = dishes.map(dish => {
            // Map nutrition theo đúng tên criteria trong DB
            const vals: Record<string, number> = {
                calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0,
            };

            dish.foods.forEach(df => {
                const q = df.quantity;
                vals.calories += df.food.calories * q;
                vals.protein += df.food.protein * q;
                vals.carbs += df.food.carbs * q;
                vals.fat += df.food.fat * q;
                vals.cost += df.food.cost * q;
            });

            // Vector theo đúng thứ tự criteria (order by id ASC)
            const vector = criteria.map(c => vals[c.name] ?? 0);

            const details: Record<string, number> = {
                calories: vals.calories,
                protein: vals.protein,
                carbs: vals.carbs,
                fat: vals.fat,
                cost: vals.cost,
            };

            return { id: dish.id, name: dish.name, vector, details };
        });

        // 4. Chạy TOPSIS
        const decisionMatrix = dishData.map(d => d.vector);
        const scores = this.topsis.rank(decisionMatrix, weights, criteriaTypes);

        return { criteria, weights, criteriaTypes, dishData, scores };
    }
}