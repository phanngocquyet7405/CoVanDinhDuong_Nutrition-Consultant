import * as Joi from 'joi';

/**
 * Schema validate toàn bộ biến môi trường (.env) lúc app khởi động
 *
 * Nếu thiếu biến bắt buộc hoặc sai kiểu dữ liệu → app crash ngay lập tức
 * với thông báo lỗi rõ ràng thay vì lỗi ngầm trong runtime.
 *
 * Đăng ký trong ConfigModule.forRoot({ validationSchema })
 */
export const validationSchema = Joi.object({

    // ── Môi trường ──────────────────────────────────────────────────
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development')
        .description('Môi trường chạy ứng dụng'),

    PORT: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .default(3000)
        .description('Cổng HTTP server lắng nghe'),

    // ── Database (bắt buộc) ─────────────────────────────────────────
    DB_HOST: Joi.string()
        .hostname()
        .required()
        .description('Hostname hoặc IP của MySQL server'),

    DB_PORT: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .default(3306)
        .description('Cổng MySQL — mặc định 3306'),

    DB_USERNAME: Joi.string()
        .min(1)
        .required()
        .description('Tên đăng nhập MySQL'),

    DB_PASSWORD: Joi.string()
        .allow('')             // Cho phép password rỗng (dev local)
        .required()
        .description('Mật khẩu MySQL'),

    DB_DATABASE: Joi.string()
        .min(1)
        .required()
        .description('Tên database MySQL'),

    // ── JWT (bắt buộc) ──────────────────────────────────────────────
    JWT_SECRET: Joi.string()
        .min(16)               // Tối thiểu 16 ký tự để đảm bảo an toàn
        .required()
        .description('Khoá bí mật ký JWT — phải ≥ 16 ký tự'),

    JWT_EXPIRES_IN: Joi.string()
        .pattern(/^\d+[smhd]$/) // Định dạng: 15m | 1h | 7d | 30d
        .default('7d')
        .description('Thời hạn access token — vd: 15m, 1h, 7d'),

    // ── Tuỳ chọn ────────────────────────────────────────────────────
    ALLOWED_ORIGINS: Joi.string()
        .default('http://localhost:3000')
        .description('Danh sách origin cho phép CORS, phân cách bằng dấu phẩy'),

    JWT_ISSUER: Joi.string()
        .default('nutrition-dss')
        .description('Trường iss trong JWT payload'),

    JWT_AUDIENCE: Joi.string()
        .default('nutrition-dss-client')
        .description('Trường aud trong JWT payload'),

    UPLOAD_DIR: Joi.string()
        .default('uploads')
        .description('Thư mục lưu file upload'),
});