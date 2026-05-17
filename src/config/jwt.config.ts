import { registerAs } from '@nestjs/config';

/**
 * Cấu hình JWT (JSON Web Token)
 * Truy cập trong code: configService.get('jwt.secret')
 *
 * Sử dụng:
 *   JwtModule.registerAsync({
 *     inject: [ConfigService],
 *     useFactory: (cfg: ConfigService) => ({
 *       secret:      cfg.get('jwt.secret'),
 *       signOptions: { expiresIn: cfg.get('jwt.expiresIn') },
 *     }),
 *   })
 */
export const jwtConfig = registerAs('jwt', () => ({
    // ── Access Token ──────────────────────────────────────────────────
    // Secret phải đủ mạnh (≥ 32 ký tự) và được lưu an toàn trong .env
    // TUYỆT ĐỐI không commit secret thật lên git
    secret: process.env.JWT_SECRET ?? 'FALLBACK_SECRET_CHANGE_ME_IN_PRODUCTION',

    // Thời hạn access token
    // Định dạng: '15m' | '1h' | '7d' | '30d'
    // Nên để ngắn (15m–1h) ở production, dùng kết hợp refresh token
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

    // ── Refresh Token (tuỳ chọn — dùng khi triển khai refresh flow) ──
    // refreshSecret:    process.env.JWT_REFRESH_SECRET ?? 'REFRESH_SECRET',
    // refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',

    // ── Cấu hình bổ sung ──────────────────────────────────────────────
    // issuer: tên app — ghi vào trường 'iss' của JWT payload
    issuer: process.env.JWT_ISSUER ?? 'nutrition-dss',

    // audience: client được phép dùng token này
    audience: process.env.JWT_AUDIENCE ?? 'nutrition-dss-client',
}));