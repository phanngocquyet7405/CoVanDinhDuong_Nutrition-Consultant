import { Injectable } from '@nestjs/common';

@Injectable()
export class TopsisService {

    /**
     * Normalize ma trận theo vector norm (Euclidean)
     * Tránh chia cho 0 nếu cả cột bằng 0
     */
    private normalize(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const denom = Array(cols).fill(0);

        for (let j = 0; j < cols; j++) {
            for (let i = 0; i < rows; i++) {
                denom[j] += matrix[i][j] ** 2;
            }
            denom[j] = Math.sqrt(denom[j]);
        }

        return matrix.map(row =>
            row.map((val, j) => (denom[j] === 0 ? 0 : val / denom[j]))
        );
    }

    /**
     * Thuật toán TOPSIS
     *
     * @param matrix        Ma trận quyết định n×m (n món ăn, m tiêu chí)
     * @param weights       Mảng m weight đã normalize (tổng = 1)
     * @param criteriaTypes Mảng m string: 'benefit' | 'cost'
     * @returns             Mảng n score trong khoảng [0, 1]
     *                      Score càng cao → phương án càng tốt
     */
    rank(
        matrix: number[][],
        weights: number[],
        criteriaTypes: string[],
    ): number[] {
        // Guard: matrix rỗng
        if (!matrix.length || !matrix[0].length) return [];

        const norm = this.normalize(matrix);
        const cols = norm[0].length;
        const isBenefit = criteriaTypes.map(t => t === 'benefit');

        // Weighted normalized matrix
        const weighted = norm.map(row =>
            row.map((val, j) => val * weights[j])
        );

        // Ideal best và worst
        const idealBest = Array(cols).fill(0);
        const idealWorst = Array(cols).fill(0);

        for (let j = 0; j < cols; j++) {
            const col = weighted.map(r => r[j]);
            idealBest[j] = isBenefit[j] ? Math.max(...col) : Math.min(...col);
            idealWorst[j] = isBenefit[j] ? Math.min(...col) : Math.max(...col);
        }

        // Tính closeness coefficient cho mỗi phương án
        return weighted.map(row => {
            let dBest = 0;
            let dWorst = 0;

            row.forEach((val, j) => {
                dBest += (val - idealBest[j]) ** 2;
                dWorst += (val - idealWorst[j]) ** 2;
            });

            dBest = Math.sqrt(dBest);
            dWorst = Math.sqrt(dWorst);

            // Nếu mọi phương án giống nhau hoàn toàn → score = 0.5
            if (dBest + dWorst === 0) return 0.5;

            return dWorst / (dBest + dWorst);
        });
    }
}