/**
 * shared/constants/nutrition.constants.ts
 *
 * Toàn bộ enum và hằng số dinh dưỡng dùng xuyên suốt app.
 * Giá trị enum phải khớp với giá trị trong MySQL (ENUM column).
 */

// ═══════════════════════════════════════════════════════════════════
// ENUM
// ═══════════════════════════════════════════════════════════════════

/** Vai trò người dùng — khớp MySQL ENUM('admin','nutritionist','user') */
export enum UserRole {
    ADMIN = 'admin',
    NUTRITIONIST = 'nutritionist',
    USER = 'user',
}

/** Giới tính — ảnh hưởng công thức BMR */
export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

/**
 * Mức độ hoạt động thể chất
 * Ảnh hưởng TDEE multiplier (1.2 → 1.9)
 */
export enum ActivityLevel {
    SEDENTARY = 'sedentary',          // ×1.200 — văn phòng, ít đi lại
    LIGHTLY_ACTIVE = 'lightly_active',     // ×1.375 — tập 1–3 buổi/tuần
    MODERATELY_ACTIVE = 'moderately_active',  // ×1.550 — tập 3–5 buổi/tuần
    VERY_ACTIVE = 'very_active',        // ×1.725 — tập 6–7 buổi/tuần
    EXTRA_ACTIVE = 'extra_active',       // ×1.900 — 2 buổi/ngày hoặc lao động nặng
}

/**
 * Mục tiêu sức khoẻ
 * Quyết định calorie adjustment, macro ratio, AHP weights preset, LP constraints
 */
export enum Goal {
    WEIGHT_LOSS = 'weight_loss',      // Deficit 500kcal — ưu tiên protein + fiber
    WEIGHT_GAIN = 'weight_gain',      // Surplus 500kcal — ưu tiên calories + protein
    MAINTAIN_WEIGHT = 'maintain_weight',  // Ngang TDEE — cân bằng macro
    MUSCLE_GAIN = 'muscle_gain',      // Surplus 300kcal — protein cao nhất
    IMPROVE_HEALTH = 'improve_health',   // Deficit 200kcal — ưu tiên fiber, giảm fat
}

/** Nhóm thực phẩm — khớp MySQL ENUM trong bảng foods */
export enum FoodCategory {
    VEGETABLES = 'vegetables',
    FRUITS = 'fruits',
    GRAINS = 'grains',
    PROTEIN = 'protein',
    DAIRY = 'dairy',
    FATS_OILS = 'fats_oils',
    BEVERAGES = 'beverages',
    SNACKS = 'snacks',
    SEAFOOD = 'seafood',
    LEGUMES = 'legumes',
}

/** Loại bữa ăn */
export enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner',
    SNACK = 'snack',
}

/** Tâm trạng trong ngày (NutritionLog) */
export enum Mood {
    GREAT = 'great',
    GOOD = 'good',
    NEUTRAL = 'neutral',
    BAD = 'bad',
}

/** Thuật toán DSS */
export enum AlgorithmUsed {
    AHP = 'AHP',
    TOPSIS = 'TOPSIS',
    LP = 'LP',
    HYBRID = 'hybrid',
}

/** Loại gợi ý DSS */
export enum RecommendationType {
    FOOD_SWAP = 'food_swap',
    MEAL_PLAN = 'meal_plan',
    DAILY_ADJUSTMENT = 'daily_adjustment',
    DEFICIT_FIX = 'deficit_fix',
}

// ═══════════════════════════════════════════════════════════════════
// HẰNG SỐ — TÍNH TOÁN DINH DƯỠNG
// ═══════════════════════════════════════════════════════════════════

/** Calories cung cấp bởi 1 gram macronutrient (Atwater) */
export const CALORIES_PER_GRAM = {
    protein: 4,
    carbohydrates: 4,
    fat: 9,
    alcohol: 7,
} as const;

/** Hệ số nhân TDEE theo mức hoạt động */
export const TDEE_MULTIPLIERS: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.200,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.550,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTRA_ACTIVE]: 1.900,
};

/** Điều chỉnh calories so với TDEE theo goal (kcal/ngày) */
export const CALORIE_ADJUSTMENT: Record<Goal, number> = {
    [Goal.WEIGHT_LOSS]: -500,
    [Goal.WEIGHT_GAIN]: +500,
    [Goal.MAINTAIN_WEIGHT]: 0,
    [Goal.MUSCLE_GAIN]: +300,
    [Goal.IMPROVE_HEALTH]: -200,
};

/** Tỉ lệ macro theo goal (% tổng calories) */
export const MACRO_RATIOS: Record<Goal, {
    protein: number;
    carbs: number;
    fat: number;
}> = {
    [Goal.WEIGHT_LOSS]: { protein: 0.35, carbs: 0.40, fat: 0.25 },
    [Goal.WEIGHT_GAIN]: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    [Goal.MAINTAIN_WEIGHT]: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    [Goal.MUSCLE_GAIN]: { protein: 0.35, carbs: 0.45, fat: 0.20 },
    [Goal.IMPROVE_HEALTH]: { protein: 0.20, carbs: 0.55, fat: 0.25 },
};

// ═══════════════════════════════════════════════════════════════════
// HẰNG SỐ — AHP
// ═══════════════════════════════════════════════════════════════════

/**
 * Preset độ quan trọng tiêu chí theo goal (scale 1–9 Saaty)
 * Dùng để build pairwise matrix → tính trọng số AHP
 */
export const AHP_IMPORTANCE_PRESET: Record<Goal, Record<string, number>> = {
    [Goal.WEIGHT_LOSS]: { calories: 5, protein: 4, fiber: 3, fat: 2, carbohydrates: 1 },
    [Goal.WEIGHT_GAIN]: { calories: 5, protein: 5, carbohydrates: 3, fat: 2, fiber: 1 },
    [Goal.MUSCLE_GAIN]: { protein: 5, calories: 4, carbohydrates: 3, fat: 2, fiber: 1 },
    [Goal.MAINTAIN_WEIGHT]: { calories: 3, protein: 3, carbohydrates: 3, fat: 3, fiber: 3 },
    [Goal.IMPROVE_HEALTH]: { fiber: 5, protein: 4, fat: 3, carbohydrates: 2, calories: 1 },
};

/**
 * Tiêu chí benefit (cao hơn = tốt) hay cost (thấp hơn = tốt)
 * Dùng trong TOPSIS để xác định ideal solution
 */
export const CRITERIA_IS_BENEFIT: Record<string, boolean> = {
    calories: false,  // Muốn ít calories hơn (trừ weight_gain)
    protein: true,   // Muốn nhiều protein hơn
    carbohydrates: false,  // Muốn ít carbs hơn
    fat: false,  // Muốn ít fat hơn
    fiber: true,   // Muốn nhiều fiber hơn
};

/** Random Consistency Index theo Saaty 1980 */
export const AHP_RANDOM_INDEX: Record<number, number> = {
    1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
    6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
};

/** CR < ngưỡng này thì ma trận nhất quán */
export const AHP_CR_THRESHOLD = 0.1;

// ═══════════════════════════════════════════════════════════════════
// HẰNG SỐ — SỨC KHOẺ
// ═══════════════════════════════════════════════════════════════════

/** Phân loại BMI theo WHO */
export const BMI_CATEGORIES = [
    { label: 'Thiếu cân nặng', min: 0, max: 18.5 },
    { label: 'Bình thường', min: 18.5, max: 25.0 },
    { label: 'Thừa cân', min: 25.0, max: 30.0 },
    { label: 'Béo phì độ I', min: 30.0, max: 35.0 },
    { label: 'Béo phì độ II', min: 35.0, max: 40.0 },
    { label: 'Béo phì độ III', min: 40.0, max: Infinity },
] as const;

/** Lượng nước khuyến nghị: ml / kg cân nặng */
export const WATER_ML_PER_KG = 35;

/** Phân loại Glycemic Index */
export const GLYCEMIC_INDEX_LEVELS = {
    LOW: { max: 55, label: 'Thấp — ổn định đường huyết' },
    MEDIUM: { max: 69, label: 'Trung bình' },
    HIGH: { max: 100, label: 'Cao — tăng đường huyết nhanh' },
} as const;

// ═══════════════════════════════════════════════════════════════════
// HẰNG SỐ — GIỚI HẠN API
// ═══════════════════════════════════════════════════════════════════

export const API_LIMITS = {
    maxFoodsPerQuery: 50,
    maxMealPlansPerUser: 10,
    maxLogHistory: 90,   // ngày
    defaultPageSize: 20,
    maxPageSize: 100,
} as const;