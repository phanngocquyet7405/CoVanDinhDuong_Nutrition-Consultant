/**
 * shared/types/index.ts
 *
 * Tập trung tất cả TypeScript type và interface dùng chung toàn app.
 * Không import bất kỳ thư viện framework nào (NestJS, TypeORM...).
 * Chỉ định nghĩa hình dạng dữ liệu — không chứa logic.
 */

// ═══════════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════════

/** Query params phân trang từ request */
export interface PaginationQuery {
    page?: number;  // Trang hiện tại — bắt đầu từ 1 (default: 1)
    limit?: number;  // Số item mỗi trang (default: 20, max: 100)
}

/** Metadata kèm theo kết quả phân trang */
export interface PaginationMeta {
    total: number;   // Tổng số item trong database
    page: number;   // Trang hiện tại
    limit: number;   // Số item mỗi trang
    totalPages: number;   // ceil(total / limit)
    hasNext: boolean;  // Còn trang tiếp theo không
    hasPrev: boolean;  // Có trang trước không
}

/** Kết quả phân trang generic */
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}

// ═══════════════════════════════════════════════════════════════════
// API RESPONSE
// ═══════════════════════════════════════════════════════════════════

/** Format response thành công — ResponseInterceptor tự bọc */
export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
}

/** Format lỗi — HttpExceptionFilter tự build */
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string | string[];
    path: string;
    method: string;
    timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════
// JWT
// ═══════════════════════════════════════════════════════════════════

/**
 * Payload mã hoá trong JWT token
 * sub là number vì MySQL dùng integer PK (khác MongoDB ObjectId)
 */
export interface JwtPayload {
    sub: number;  // userId — integer MySQL PK
    role: string;  // 'admin' | 'nutritionist' | 'user'
    iat?: number;  // Issued At — tự thêm bởi JWT
    exp?: number;  // Expiration — tự thêm bởi JWT
}

/** User object gắn vào request sau khi qua JwtAuthGuard */
export interface RequestUser {
    id: number;
    email: string;
    role: string;
    name: string;
}

// ═══════════════════════════════════════════════════════════════════
// NUTRITION — MACROS & MICROS
// ═══════════════════════════════════════════════════════════════════

/**
 * Macronutrients cơ bản (đơn vị g/100g hoặc g/ngày tuỳ context)
 * calories tính bằng kcal
 */
export interface MacroNutrients {
    calories: number;  // kcal
    protein: number;  // g
    carbohydrates: number;  // g
    fat: number;  // g
    fiber?: number;  // g
    sugar?: number;  // g
}

/**
 * Vi chất dinh dưỡng — lưu dưới dạng JSON trong bảng foods
 * Đơn vị: mg hoặc mcg tuỳ từng chất
 */
export interface Micronutrients {
    vitaminA?: number;  // mcg RAE
    vitaminC?: number;  // mg
    vitaminD?: number;  // mcg
    vitaminE?: number;  // mg
    vitaminB12?: number;  // mcg
    calcium?: number;  // mg
    iron?: number;  // mg
    sodium?: number;  // mg
    potassium?: number;  // mg
    magnesium?: number;  // mg
}

/**
 * Mục tiêu dinh dưỡng hàng ngày (tính từ TDEE + goal)
 */
export interface DailyNutritionTarget {
    calories: number;  // kcal/ngày
    protein: number;  // g/ngày
    carbohydrates: number;  // g/ngày
    fat: number;  // g/ngày
    fiber: number;  // g/ngày (≥ 25g theo WHO)
    water: number;  // ml/ngày
}

// ═══════════════════════════════════════════════════════════════════
// MEAL PLAN
// ═══════════════════════════════════════════════════════════════════

/** Một món ăn trong bữa (tham chiếu đến food.id) */
export interface MealItem {
    foodId: number;
    foodName: string;
    amountG: number;  // Gram thực tế ăn
    calories: number;  // Đã scale theo amountG
    protein: number;
    carbohydrates: number;
    fat: number;
}

/** Một bữa ăn trong ngày */
export interface Meal {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: MealItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    time?: string;  // HH:mm
}

/** Kế hoạch ăn 1 ngày */
export interface DayPlan {
    dayOfWeek: number;  // 0=CN, 1=T2, ..., 6=T7
    date?: string;  // ISO date (tuỳ chọn)
    meals: Meal[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

// ═══════════════════════════════════════════════════════════════════
// DSS ALGORITHMS (AHP + TOPSIS + LP)
// ═══════════════════════════════════════════════════════════════════

/**
 * Tiêu chí đánh giá trong AHP và TOPSIS
 * isBenefit: true = càng cao càng tốt (protein, fiber)
 *            false = càng thấp càng tốt (fat, calories cho weight_loss)
 */
export interface DssCriterion {
    name: string;
    weight: number;   // Trọng số AHP (0–1, tổng = 1)
    isBenefit: boolean;
}

/**
 * Một lựa chọn thay thế trong TOPSIS (một food item)
 * values: điểm theo từng tiêu chí { calories: 130, protein: 2.7, ... }
 */
export interface DssAlternative {
    id: number;
    name: string;
    values: Record<string, number>;
}

/** Kết quả xếp hạng TOPSIS */
export interface TopsisRankingItem {
    id: number;
    name: string;
    score: number;  // Closeness coefficient (0–1)
    rank: number;  // 1 = tốt nhất
    dPositive: number;  // Khoảng cách đến ideal tích cực
    dNegative: number;  // Khoảng cách đến ideal tiêu cực
}

/** Kết quả AHP */
export interface AhpResult {
    weights: Record<string, number>;
    consistencyRatio: number;   // CR < 0.1 = hợp lệ
    isConsistent: boolean;
    lambdaMax: number;
}

/** Kết quả Linear Programming */
export interface LpResult {
    solution: Record<string, number>;  // foodId → gram
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    objectiveValue: number;
    feasible: boolean;
    constraints: string[];  // Mô tả human-readable
}

// ═══════════════════════════════════════════════════════════════════
// USER HEALTH
// ═══════════════════════════════════════════════════════════════════

/** Snapshot sức khoẻ người dùng lúc tạo recommendation (để audit) */
export interface UserHealthSnapshot {
    tdee: number;
    goal: string;
    bmi: number;
    age: number;
    gender: string;
}