import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';

/**
 * AppDataSource — Entry point dành riêng cho TypeORM CLI
 *
 * File này TÁCH BIỆT với cấu hình runtime trong database.config.ts.
 * NestJS dùng database.config.ts để kết nối khi app chạy.
 * TypeORM CLI dùng file này để chạy migration và generate schema.
 *
 * ── Các lệnh CLI sử dụng file này ─────────────────────────────────
 *
 *   Chạy tất cả migration chưa áp dụng:
 *   $ npm run migration:run
 *
 *   Tạo file migration mới từ thay đổi entity:
 *   $ npm run migration:generate -- src/database/migrations/TenMigration
 *
 *   Rollback migration gần nhất:
 *   $ npm run migration:revert
 *
 *   Xem trạng thái migration (đã chạy hay chưa):
 *   $ npm run migration:show
 *
 * ── Lưu ý ─────────────────────────────────────────────────────────
 *   - synchronize: false — BẮT BUỘC, không để TypeORM tự sửa schema
 *   - Đọc .env qua import 'dotenv/config' ở đầu file
 *   - entities path dùng glob để tự tìm tất cả *.entity.ts
 */
export const AppDataSource = new DataSource({
    type: 'mysql',

    // ── Kết nối — đọc từ .env ─────────────────────────────────────────
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'nutrition_dss',

    // ── Entity — tự tìm toàn bộ file *.entity.ts trong modules/ ───────
    entities: [
        path.join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
    ],

    // ── Migration — tìm trong thư mục migrations/ ─────────────────────
    migrations: [
        path.join(__dirname, 'migrations', '*{.ts,.js}'),
    ],

    // Tên bảng lưu lịch sử migration (mặc định: 'migrations')
    migrationsTableName: 'typeorm_migrations',

    // ── KHÔNG để TypeORM tự sync schema — dùng migration thay thế ─────
    synchronize: false,

    // ── Bật log để debug khi chạy CLI ─────────────────────────────────
    logging: true,

    // ── Timezone Việt Nam (ICT, UTC+7) ────────────────────────────────
    timezone: '+07:00',

    // ── utf8mb4 hỗ trợ emoji và Unicode đầy đủ ───────────────────────
    charset: 'utf8mb4',
});