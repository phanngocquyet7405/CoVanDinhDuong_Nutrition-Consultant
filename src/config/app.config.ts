import { registerAs } from '@nestjs/config';

/**
 * Cấu hình chung của ứng dụng
 * Truy cập trong code: configService.get('app.port')
 */
export const appConfig = registerAs('app', () => {
    const nodeEnv = process.env.NODE_ENV ?? 'development';

    return {
        // ── Môi trường ─────────────────────────────────────────────────
        nodeEnv,
        isDevelopment: nodeEnv === 'development',
        isProduction: nodeEnv === 'production',
        isTest: nodeEnv === 'test',

        // ── Server ─────────────────────────────────────────────────────
        port: parseInt(process.env.PORT ?? '3000', 10),
        globalPrefix: 'api/v1',

        // ── CORS ───────────────────────────────────────────────────────
        // Nhiều origin phân cách bằng dấu phẩy trong .env
        // Ví dụ: ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
        allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean),

        // ── Swagger ────────────────────────────────────────────────────
        // Chỉ bật Swagger ở môi trường dev/staging — tắt ở production
        swaggerEnabled: nodeEnv !== 'production',
        swaggerPath: 'api/docs',

        // ── Rate Limit ─────────────────────────────────────────────────
        // 60 request / phút / IP
        rateLimitTtl: 60_000, // ms
        rateLimitMax: 60,

        // ── Upload ─────────────────────────────────────────────────────
        maxFileSizeMb: 5,
        uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
    };
});