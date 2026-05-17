import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Cấu hình kết nối MySQL thông qua TypeORM
 * Truy cập trong code: configService.get('database.host')
 *
 * Lưu ý quan trọng:
 *  - synchronize: true  → CHỈ dùng ở development (tự đồng bộ schema)
 *  - synchronize: false → BẮT BUỘC ở production (dùng migration thay thế)
 *  - autoLoadEntities   → NestJS tự tìm entity qua TypeOrmModule.forFeature()
 */
export const databaseConfig = registerAs(
    'database',
    (): TypeOrmModuleOptions => {
        const isDev = process.env.NODE_ENV === 'development';

        return {
            // ── Loại database ─────────────────────────────────────────────
            type: 'mysql',

            // ── Kết nối ───────────────────────────────────────────────────
            host: process.env.DB_HOST ?? '127.0.0.1',
            port: parseInt(process.env.DB_PORT ?? '3306', 10),
            username: process.env.DB_USERNAME ?? 'root',
            password: process.env.DB_PASSWORD ?? '',
            database: process.env.DB_DATABASE ?? 'nutrition_dss',

            // ── Entity ────────────────────────────────────────────────────
            // autoLoadEntities: NestJS tự load entity đã đăng ký qua forFeature()
            // Không cần khai báo thủ công mảng entities ở đây
            autoLoadEntities: true,

            // ── Schema sync ───────────────────────────────────────────────
            // development : true  → tự sync schema (tiện nhưng nguy hiểm với data thật)
            // production  : false → dùng `npm run migration:run` thay thế
            synchronize: isDev,

            // ── Logging ───────────────────────────────────────────────────
            // dev  : log toàn bộ query để debug
            // prod : chỉ log error, tránh lộ thông tin nhạy cảm
            logging: isDev ? ['error', 'warn', 'schema', 'query'] : ['error'],

            // Log query chậm hơn 1000ms dù ở môi trường nào
            maxQueryExecutionTime: 1000,

            // ── Connection Pool ───────────────────────────────────────────
            // connectionLimit: số connection tối đa giữ trong pool
            // Tăng lên 20-50 nếu app có nhiều request đồng thời
            extra: {
                connectionLimit: isDev ? 5 : 20,
                // Tự động reconnect nếu mất kết nối
                waitForConnections: true,
                queueLimit: 0,
            },

            // ── Timezone ──────────────────────────────────────────────────
            // '+07:00' = Giờ Việt Nam (ICT, UTC+7)
            // Đảm bảo MySQL lưu/đọc thời gian đúng timezone
            timezone: '+07:00',

            // ── Migration ─────────────────────────────────────────────────
            // Chỉ cần khai báo khi dùng TypeORM CLI trực tiếp qua app
            // (thường dùng data-source.ts thay thế)
            migrations: [
                `${__dirname}/../database/migrations/*{.ts,.js}`,
            ],
            migrationsTableName: 'typeorm_migrations',

            // ── Charset ───────────────────────────────────────────────────
            // utf8mb4 hỗ trợ đầy đủ Unicode bao gồm emoji
            charset: 'utf8mb4',
        };
    },
);