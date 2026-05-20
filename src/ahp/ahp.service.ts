import { Injectable } from '@nestjs/common';

@Injectable()
export class AhpService {

    /**
     * Tính weight từ pairwise comparison matrix (AHP)
     * Input:  ma trận n×n (số thực dương)
     * Output: mảng n weight đã normalize (tổng = 1)
     *
     * Hiện tại vẫn giữ method này nhưng RecommendationService
     * không dùng nữa — weight được đọc trực tiếp từ DB và normalize.
     * Giữ lại để dùng trong tương lai nếu cần tính consistency ratio (CR).
     */
    calculateWeight(matrix: number[][]): number[] {
        const n = matrix.length;
        const colSum = Array(n).fill(0);

        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                colSum[j] += matrix[i][j];
            }
        }

        const normalized = matrix.map(row =>
            row.map((val, j) => val / colSum[j])
        );

        const weights = normalized.map(row =>
            row.reduce((a, b) => a + b, 0) / n
        );

        return weights;
    }

    /**
     * Tính Consistency Ratio (CR) để kiểm tra ma trận AHP có nhất quán không
     * CR < 0.1 → ma trận hợp lệ
     * CR >= 0.1 → cần xem lại pairwise comparison
     */
    consistencyRatio(matrix: number[][], weights: number[]): number {
        const n = matrix.length;

        // Random Index theo Saaty
        const RI: Record<number, number> = {
            1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12,
            6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
        };

        // Tính λmax
        let lambdaMax = 0;
        for (let i = 0; i < n; i++) {
            let rowSum = 0;
            for (let j = 0; j < n; j++) {
                rowSum += matrix[i][j] * weights[j];
            }
            lambdaMax += rowSum / weights[i];
        }
        lambdaMax /= n;

        const ci = (lambdaMax - n) / (n - 1);
        const ri = RI[n] ?? 1.49;

        return ri === 0 ? 0 : ci / ri;
    }
}