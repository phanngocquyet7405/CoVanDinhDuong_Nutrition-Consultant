import * as Joi from 'joi';

/**
 * middleware/validation.schema.ts
 *
 * Joi schema validate request body/query/params cho từng route.
 * ║  Joi Schema (file này) → validate dữ liệu đầu vào từ HTTP     ║
 * ║                    request (body, query, params)                ║
 * ║                    → hoàn toàn độc lập với database            ║
 * ║                    → dùng với ValidationMiddleware              ║
 *
 * Kết hợp sử dụng:
 *   1. ValidationMiddleware.forSchema(schema, 'body') → validate ở middleware
 *   2. class-validator trên DTO                       → validate ở Controller
 *   (Hai cơ chế bổ trợ nhau — middleware validate sớm, DTO validate chi tiết)
 */

// ═══════════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate body khi đăng ký tài khoản
 * POST /api/v1/auth/register
 */
export const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.min': 'Họ tên phải có ít nhất 2 ký tự',
            'string.max': 'Họ tên không vượt quá 100 ký tự',
            'any.required': 'Họ tên là bắt buộc',
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Email không đúng định dạng',
            'any.required': 'Email là bắt buộc',
        }),

    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
            'any.required': 'Mật khẩu là bắt buộc',
        }),
});

/**
 * Validate body khi đăng nhập
 * POST /api/v1/auth/login
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Email không đúng định dạng',
            'any.required': 'Email là bắt buộc',
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Mật khẩu là bắt buộc',
        }),
});

// ═══════════════════════════════════════════════════════════════════
// USER PROFILE SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate body khi tạo/cập nhật hồ sơ sức khoẻ
 * PUT /api/v1/profile
 *
 * Dữ liệu MySQL: bảng user_profiles
 * Không có ObjectId, không có _id — chỉ có integer id (MySQL PK)
 */
export const profileSchema = Joi.object({
    gender: Joi.string()
        .valid('male', 'female', 'other')
        .required()
        .messages({
            'any.only': 'Giới tính phải là male | female | other',
            'any.required': 'Giới tính là bắt buộc',
        }),

    age: Joi.number()
        .integer()
        .min(1)
        .max(120)
        .required()
        .messages({
            'number.min': 'Tuổi phải lớn hơn 0',
            'number.max': 'Tuổi không hợp lệ',
            'any.required': 'Tuổi là bắt buộc',
        }),

    heightCm: Joi.number()
        .min(50)
        .max(300)
        .required()
        .messages({
            'number.min': 'Chiều cao phải ít nhất 50cm',
            'number.max': 'Chiều cao không hợp lệ (tối đa 300cm)',
            'any.required': 'Chiều cao là bắt buộc',
        }),

    weightKg: Joi.number()
        .min(1)
        .max(500)
        .precision(2)
        .required()
        .messages({
            'number.min': 'Cân nặng phải lớn hơn 0',
            'number.max': 'Cân nặng không hợp lệ (tối đa 500kg)',
            'any.required': 'Cân nặng là bắt buộc',
        }),

    activityLevel: Joi.string()
        .valid(
            'sedentary',
            'lightly_active',
            'moderately_active',
            'very_active',
            'extra_active',
        )
        .default('sedentary')
        .messages({
            'any.only': 'Mức hoạt động không hợp lệ',
        }),

    goal: Joi.string()
        .valid(
            'weight_loss',
            'weight_gain',
            'maintain_weight',
            'muscle_gain',
            'improve_health',
        )
        .default('maintain_weight')
        .messages({
            'any.only': 'Mục tiêu không hợp lệ',
        }),

    allergies: Joi.array()
        .items(Joi.string().trim().max(50))
        .default([])
        .messages({
            'array.base': 'Danh sách dị ứng phải là mảng',
        }),

    medicalConditions: Joi.array()
        .items(Joi.string().trim().max(100))
        .default([])
        .messages({
            'array.base': 'Danh sách bệnh lý phải là mảng',
        }),

    dietaryRestrictions: Joi.array()
        .items(Joi.string().trim().max(50))
        .default([])
        .messages({
            'array.base': 'Danh sách kiêng kị phải là mảng',
        }),
});

// ═══════════════════════════════════════════════════════════════════
// FOOD SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate query params khi tìm kiếm thực phẩm
 * GET /api/v1/foods?category=protein&q=gà&page=1&limit=20
 */
export const foodQuerySchema = Joi.object({
    q: Joi.string().trim().max(100).optional(),

    category: Joi.string()
        .valid(
            'vegetables', 'fruits', 'grains', 'protein',
            'dairy', 'fats_oils', 'beverages', 'snacks',
            'seafood', 'legumes',
        )
        .optional()
        .messages({
            'any.only': 'Nhóm thực phẩm không hợp lệ',
        }),

    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

/**
 * Validate body khi thêm thực phẩm mới (admin/nutritionist)
 * POST /api/v1/foods
 *
 * Tất cả macro per 100g — lưu vào bảng foods (MySQL decimal)
 * Không có Mongoose subdocument, không có _id lồng nhau
 */
export const createFoodSchema = Joi.object({
    name: Joi.string().trim().max(150).required()
        .messages({ 'any.required': 'Tên tiếng Anh là bắt buộc' }),

    nameVi: Joi.string().trim().max(150).required()
        .messages({ 'any.required': 'Tên tiếng Việt là bắt buộc' }),

    category: Joi.string()
        .valid(
            'vegetables', 'fruits', 'grains', 'protein',
            'dairy', 'fats_oils', 'beverages', 'snacks',
            'seafood', 'legumes',
        )
        .required()
        .messages({ 'any.required': 'Nhóm thực phẩm là bắt buộc' }),

    // ── Macros per 100g (lưu vào cột decimal MySQL) ──────────────────
    calories: Joi.number().min(0).required()
        .messages({ 'any.required': 'Calories là bắt buộc' }),
    protein: Joi.number().min(0).required()
        .messages({ 'any.required': 'Protein là bắt buộc' }),
    carbohydrates: Joi.number().min(0).required()
        .messages({ 'any.required': 'Carbohydrates là bắt buộc' }),
    fat: Joi.number().min(0).required()
        .messages({ 'any.required': 'Fat là bắt buộc' }),
    fiber: Joi.number().min(0).default(0),
    sugar: Joi.number().min(0).default(0),

    // ── Thông tin phụ (lưu JSON trong MySQL) ─────────────────────────
    micronutrients: Joi.object({
        vitaminA: Joi.number().min(0).optional(),
        vitaminC: Joi.number().min(0).optional(),
        vitaminD: Joi.number().min(0).optional(),
        calcium: Joi.number().min(0).optional(),
        iron: Joi.number().min(0).optional(),
        sodium: Joi.number().min(0).optional(),
        potassium: Joi.number().min(0).optional(),
        magnesium: Joi.number().min(0).optional(),
    }).optional(),

    servingSizeG: Joi.number().integer().min(1).default(100),
    tags: Joi.array().items(Joi.string().trim()).default([]),
    allergens: Joi.array().items(Joi.string().trim()).default([]),
    glycemicIndex: Joi.number().integer().min(0).max(100).optional(),
    imageUrl: Joi.string().uri().max(500).optional(),
});

// ═══════════════════════════════════════════════════════════════════
// NUTRITION LOG SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate một meal item (dùng trong addMealSchema)
 * foodId là INTEGER — MySQL PK của bảng foods (không phải ObjectId MongoDB)
 */
const mealItemSchema = Joi.object({
    foodId: Joi.number().integer().positive().required()
        .messages({ 'any.required': 'foodId (số nguyên) là bắt buộc' }),
    foodName: Joi.string().trim().max(150).required(),
    amountG: Joi.number().positive().required()
        .messages({ 'number.positive': 'Lượng ăn phải lớn hơn 0' }),
    calories: Joi.number().min(0).required(),
    protein: Joi.number().min(0).required(),
    carbohydrates: Joi.number().min(0).required(),
    fat: Joi.number().min(0).required(),
});

/**
 * Validate body khi ghi nhận bữa ăn
 * POST /api/v1/nutrition-logs/meal
 */
export const addMealSchema = Joi.object({
    type: Joi.string()
        .valid('breakfast', 'lunch', 'dinner', 'snack')
        .required()
        .messages({
            'any.only': 'Loại bữa ăn phải là breakfast | lunch | dinner | snack',
            'any.required': 'Loại bữa ăn là bắt buộc',
        }),

    items: Joi.array()
        .items(mealItemSchema)
        .min(1)
        .required()
        .messages({
            'array.min': 'Phải có ít nhất 1 món ăn',
            'any.required': 'Danh sách món ăn là bắt buộc',
        }),
});

/**
 * Validate body khi cập nhật nhật ký ngày (nước, tâm trạng, ghi chú)
 * PATCH /api/v1/nutrition-logs/today
 */
export const updateDailyLogSchema = Joi.object({
    waterIntakeMl: Joi.number().integer().min(0).max(10000).optional()
        .messages({ 'number.max': 'Lượng nước tối đa 10,000ml/ngày' }),

    notes: Joi.string().trim().max(500).optional(),

    mood: Joi.string()
        .valid('great', 'good', 'neutral', 'bad')
        .optional()
        .messages({ 'any.only': 'Tâm trạng phải là great | good | neutral | bad' }),

    energyLevel: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({ 'number.min': 'Mức năng lượng từ 1–5' }),
});

// ═══════════════════════════════════════════════════════════════════
// PAGINATION SCHEMA (dùng lại cho nhiều route)
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate query params phân trang chung
 * GET /api/v1/[any]?page=1&limit=20
 */
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
}).unknown(true); // allow thêm query params khác

// ═══════════════════════════════════════════════════════════════════
// ID PARAM SCHEMA
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate :id param — INTEGER MySQL PK
 *
 * Lưu ý: KHÔNG dùng ObjectId 24-char hex (đó là MongoDB)
 * MySQL dùng auto-increment integer: 1, 2, 3, ...
 */
export const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'ID phải là số nguyên',
            'number.positive': 'ID phải lớn hơn 0',
            'any.required': 'ID là bắt buộc',
        }),
});