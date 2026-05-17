/**
 * shared/utils/nutrition.utils.ts
 *
 * Hàm tính toán dinh dưỡng và thuật toán DSS — thuần TypeScript.
 * Không có NestJS dependency — có thể test độc lập với Jest.
 *
 * Nguồn:
 *   BMR  : Mifflin-St Jeor Equation (1990)
 *   TDEE : Harris-Benedict revision
 *   Macro: AMDR — WHO/FAO
 *   AHP  : Saaty (1980)
 *   TOPSIS: Hwang & Yoon (1981)
 */

import {
    ActivityLevel,
    AHP_CR_THRESHOLD,
    AHP_IMPORTANCE_PRESET,
    AHP_RANDOM_INDEX,
    BMI_CATEGORIES,
    CALORIE_ADJUSTMENT,
    CALORIES_PER_GRAM,
    CRITERIA_IS_BENEFIT,
    Goal,
    MACRO_RATIOS,
    TDEE_MULTIPLIERS,
    WATER_ML_PER_KG,
} from '../constants/nutrition.constrants';
import {
    AhpResult,
    DailyNutritionTarget,
    DssAlternative,
    DssCriterion,
    MacroNutrients,
    TopsisRankingItem,
} from '../types';

// ═══════════════════════════════════════════════════════════════════
// BMI / BMR / TDEE
// ═══════════════════════════════════════════════════════════════════

/**
 * Tính BMI = weight(kg) / height(m)²
 * @example calcBMI(65, 170) → 22.49
 */
export function calcBMI(weightKg: number, heightCm: number): number {
    if (heightCm <= 0 || weightKg <= 0) return 0;
    const h = heightCm / 100;
    return parseFloat((weightKg / (h * h)).toFixed(2));
}

/**
 * Phân loại BMI theo WHO
 * @example getBMICategory(22.49) → "Bình thường"
 */
export function getBMICategory(bmi: number): string {
    return (
        BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max)?.label ??
        'Không xác định'
    );
}

/**
 * Tính BMR — Basal Metabolic Rate (Mifflin-St Jeor, 1990)
 *   Nam:  10×W + 6.25×H - 5×A + 5
 *   Nữ:   10×W + 6.25×H - 5×A - 161
 * @example calcBMR(65, 170, 25, 'male') → 1673.75
 */
export function calcBMR(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: string,
): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return parseFloat((gender === 'male' ? base + 5 : base - 161).toFixed(2));
}

/**
 * Tính TDEE = BMR × activity multiplier
 * @example calcTDEE(1673.75, ActivityLevel.MODERATELY_ACTIVE) → 2594.31
 */
export function calcTDEE(bmr: number, activityLevel: ActivityLevel | string): number {
    const multiplier = TDEE_MULTIPLIERS[activityLevel as ActivityLevel] ?? 1.2;
    return parseFloat((bmr * multiplier).toFixed(2));
}

/**
 * Mục tiêu calories/ngày = TDEE + adjustment theo goal
 * @example calcTargetCalories(2000, Goal.WEIGHT_LOSS) → 1500
 */
export function calcTargetCalories(tdee: number, goal: Goal | string): number {
    const adjustment = CALORIE_ADJUSTMENT[goal as Goal] ?? 0;
    return Math.round(tdee + adjustment);
}

/**
 * Tính macro targets (g/ngày) theo tỉ lệ % calories
 * @example calcMacroTargets(1500, Goal.WEIGHT_LOSS) → { protein: 131, carbs: 150, fat: 42 }
 */
export function calcMacroTargets(
    targetCalories: number,
    goal: Goal | string,
): { protein: number; carbs: number; fat: number } {
    const ratio = MACRO_RATIOS[goal as Goal] ?? MACRO_RATIOS[Goal.MAINTAIN_WEIGHT];
    return {
        protein: Math.round((targetCalories * ratio.protein) / CALORIES_PER_GRAM.protein),
        carbs: Math.round((targetCalories * ratio.carbs) / CALORIES_PER_GRAM.carbohydrates),
        fat: Math.round((targetCalories * ratio.fat) / CALORIES_PER_GRAM.fat),
    };
}

/** Lượng nước khuyến nghị (ml/ngày) = weight × 35 */
export function calcWaterIntake(weightKg: number): number {
    return Math.round(weightKg * WATER_ML_PER_KG);
}

/**
 * Tổng hợp mục tiêu dinh dưỡng đầy đủ (all-in-one)
 */
export function calcDailyTarget(
    tdee: number,
    goal: Goal | string,
    weightKg: number,
): DailyNutritionTarget {
    const calories = calcTargetCalories(tdee, goal);
    const macros = calcMacroTargets(calories, goal);
    return {
        calories,
        protein: macros.protein,
        carbohydrates: macros.carbs,
        fat: macros.fat,
        fiber: 25,  // WHO: ≥ 25g/ngày
        water: calcWaterIntake(weightKg),
    };
}

// ═══════════════════════════════════════════════════════════════════
// MACRO SCALING & TỔNG HỢP
// ═══════════════════════════════════════════════════════════════════

/**
 * Scale macro từ per-100g sang lượng ăn thực tế
 * @example scaleMacros({ calories:130, protein:2.7, carbohydrates:28.2, fat:0.3 }, 200)
 *          → { calories:260, protein:5.4, carbohydrates:56.4, fat:0.6 }
 */
export function scaleMacros(per100g: MacroNutrients, amountG: number): MacroNutrients {
    const f = amountG / 100;
    return {
        calories: parseFloat((per100g.calories * f).toFixed(2)),
        protein: parseFloat((per100g.protein * f).toFixed(2)),
        carbohydrates: parseFloat((per100g.carbohydrates * f).toFixed(2)),
        fat: parseFloat((per100g.fat * f).toFixed(2)),
        fiber: parseFloat(((per100g.fiber ?? 0) * f).toFixed(2)),
        sugar: parseFloat(((per100g.sugar ?? 0) * f).toFixed(2)),
    };
}

/** Cộng tổng macro từ danh sách items */
export function sumMacros(items: MacroNutrients[]): MacroNutrients {
    return items.reduce(
        (acc, m) => ({
            calories: parseFloat((acc.calories + m.calories).toFixed(2)),
            protein: parseFloat((acc.protein + m.protein).toFixed(2)),
            carbohydrates: parseFloat((acc.carbohydrates + m.carbohydrates).toFixed(2)),
            fat: parseFloat((acc.fat + m.fat).toFixed(2)),
            fiber: parseFloat(((acc.fiber ?? 0) + (m.fiber ?? 0)).toFixed(2)),
        }),
        { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
    );
}

/**
 * % đạt mục tiêu (0–100)
 * @example calcProgress(1800, 2000) → 90.0
 */
export function calcProgress(actual: number, target: number): number {
    if (target === 0) return 0;
    return parseFloat(Math.min(100, (actual / target) * 100).toFixed(1));
}

// ═══════════════════════════════════════════════════════════════════
// AHP — Analytic Hierarchy Process
// ═══════════════════════════════════════════════════════════════════

/**
 * Tính trọng số AHP từ ma trận so sánh cặp n×n
 *
 * Bước 1: Chuẩn hoá từng cột (chia cho tổng cột)
 * Bước 2: Trọng số = trung bình hàng
 * Bước 3: λmax = trung bình (Aw)_i / w_i
 * Bước 4: CI = (λmax - n) / (n - 1)
 * Bước 5: CR = CI / RI[n]  →  hợp lệ nếu CR < 0.1
 */
export function computeAHP(criteria: string[], matrix: number[][]): AhpResult {
    const n = criteria.length;

    // Bước 1: tổng cột
    const colSums = Array<number>(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) colSums[j] += matrix[i][j];
    }

    // Bước 2: trọng số (trung bình hàng của ma trận chuẩn hoá)
    const raw = Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) raw[i] += matrix[i][j] / colSums[j];
        raw[i] /= n;
    }

    // Bước 3: λmax
    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
        let ws = 0;
        for (let j = 0; j < n; j++) ws += matrix[i][j] * raw[j];
        lambdaMax += ws / raw[i];
    }
    lambdaMax /= n;

    // Bước 4 & 5: CI và CR
    const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
    const ri = AHP_RANDOM_INDEX[n] ?? 1.49;
    const cr = ri !== 0 ? ci / ri : 0;

    const weights: Record<string, number> = {};
    criteria.forEach((c, i) => (weights[c] = parseFloat(raw[i].toFixed(4))));

    return {
        weights,
        consistencyRatio: parseFloat(cr.toFixed(4)),
        isConsistent: cr < AHP_CR_THRESHOLD,
        lambdaMax: parseFloat(lambdaMax.toFixed(4)),
    };
}

/**
 * Xây dựng pairwise matrix từ map độ quan trọng
 * a_ij = importance_i / importance_j
 */
export function buildAHPMatrix(
    criteria: string[],
    importanceMap: Record<string, number>,
): number[][] {
    const n = criteria.length;
    return Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => {
            if (i === j) return 1;
            return parseFloat(
                ((importanceMap[criteria[i]] ?? 1) / (importanceMap[criteria[j]] ?? 1)).toFixed(4),
            );
        }),
    );
}

/**
 * Lấy preset AHP theo goal người dùng rồi tính ngay trọng số
 */
export function getAHPWeightsByGoal(
    criteria: string[],
    goal: Goal | string,
): AhpResult {
    const preset = AHP_IMPORTANCE_PRESET[goal as Goal] ?? AHP_IMPORTANCE_PRESET[Goal.MAINTAIN_WEIGHT];
    const matrix = buildAHPMatrix(criteria, preset);
    return computeAHP(criteria, matrix);
}

// ═══════════════════════════════════════════════════════════════════
// TOPSIS — Technique for Order of Preference by Similarity to Ideal Solution
// ═══════════════════════════════════════════════════════════════════

/**
 * Xếp hạng thực phẩm bằng TOPSIS
 *
 * Bước 1: Chuẩn hoá Euclidean: r_ij = x_ij / sqrt(sum x_ij²)
 * Bước 2: Nhân trọng số:       v_ij = w_j × r_ij
 * Bước 3: Tìm A+ (tốt nhất) và A- (tệ nhất)
 * Bước 4: D+ = khoảng cách đến A+, D- = khoảng cách đến A-
 * Bước 5: Closeness coefficient Ci* = D- / (D+ + D-)
 * Bước 6: Sắp xếp giảm dần theo Ci*
 */
export function computeTOPSIS(
    alternatives: DssAlternative[],
    criteria: DssCriterion[],
): TopsisRankingItem[] {
    const m = alternatives.length;
    const n = criteria.length;
    if (m === 0 || n === 0) return [];

    // Ma trận quyết định
    const X = alternatives.map((a) => criteria.map((c) => a.values[c.name] ?? 0));

    // Bước 1: chuẩn hoá Euclidean
    const colNorms = criteria.map((_, j) =>
        Math.sqrt(X.reduce((s, row) => s + row[j] ** 2, 0)),
    );
    const R = X.map((row) => row.map((v, j) => (colNorms[j] ? v / colNorms[j] : 0)));

    // Bước 2: nhân trọng số
    const V = R.map((row) => row.map((v, j) => v * criteria[j].weight));

    // Bước 3: A+ và A-
    const aPos: number[] = [];
    const aNeg: number[] = [];
    criteria.forEach((c, j) => {
        const col = V.map((row) => row[j]);
        const isBenefit = c.isBenefit !== undefined
            ? c.isBenefit
            : (CRITERIA_IS_BENEFIT[c.name] ?? true);
        aPos.push(isBenefit ? Math.max(...col) : Math.min(...col));
        aNeg.push(isBenefit ? Math.min(...col) : Math.max(...col));
    });

    // Bước 4: khoảng cách
    const dPos = alternatives.map((_, i) =>
        Math.sqrt(criteria.reduce((s, __, j) => s + (V[i][j] - aPos[j]) ** 2, 0)),
    );
    const dNeg = alternatives.map((_, i) =>
        Math.sqrt(criteria.reduce((s, __, j) => s + (V[i][j] - aNeg[j]) ** 2, 0)),
    );

    // Bước 5 & 6: Ci* và xếp hạng
    return alternatives
        .map((a, i) => ({
            id: a.id,
            name: a.name,
            score: parseFloat(
                (dPos[i] + dNeg[i] !== 0 ? dNeg[i] / (dPos[i] + dNeg[i]) : 0).toFixed(4),
            ),
            rank: 0,
            dPositive: parseFloat(dPos[i].toFixed(4)),
            dNegative: parseFloat(dNeg[i].toFixed(4)),
        }))
        .sort((a, b) => b.score - a.score)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
}