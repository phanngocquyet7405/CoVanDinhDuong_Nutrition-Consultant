import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration 001 — Tạo bảng users
 *
 * Bảng trung tâm của hệ thống. Tất cả bảng khác đều có FK đến users.id
 *
 * Cột:
 *   id         — Primary key, auto increment
 *   name       — Họ tên hiển thị (max 100 ký tự)
 *   email      — Email đăng nhập, unique, lowercase
 *   password   — Mật khẩu đã hash bằng bcrypt (cost factor 12)
 *   role       — Enum: admin | nutritionist | user
 *   is_active  — Khoá tài khoản mà không xoá dữ liệu (soft disable)
 *   created_at — Tự động gán khi INSERT
 *   updated_at — Tự động cập nhật khi UPDATE
 */
export class CreateUsersTable implements MigrationInterface {
    public name = 'CreateUsersTable1700000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        unsigned: true,
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                        comment: 'Primary key tự tăng',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        comment: 'Họ tên người dùng',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '150',
                        isUnique: true,
                        comment: 'Email đăng nhập, unique, lowercase',
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        length: '255',
                        comment: 'Mật khẩu hash bcrypt — không bao giờ lưu plaintext',
                    },
                    {
                        name: 'role',
                        type: 'enum',
                        enum: ['admin', 'nutritionist', 'user'],
                        default: "'user'",
                        comment: 'Phân quyền: admin | nutritionist | user',
                    },
                    {
                        name: 'is_active',
                        type: 'tinyint',
                        width: 1,
                        default: 1,
                        comment: '1 = hoạt động, 0 = bị khoá',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        comment: 'Thời điểm tạo tài khoản',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        comment: 'Thời điểm cập nhật lần cuối',
                    },
                ],
            }),
            true, // ifNotExists = true → không báo lỗi nếu bảng đã tồn tại
        );

        // Index tăng tốc truy vấn theo email (login)
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'IDX_USERS_EMAIL',
                columnNames: ['email'],
            }),
        );

        // Index tăng tốc lọc theo role + trạng thái
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'IDX_USERS_ROLE_ACTIVE',
                columnNames: ['role', 'is_active'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xoá index trước, rồi mới xoá bảng
        await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL');
        await queryRunner.dropIndex('users', 'IDX_USERS_ROLE_ACTIVE');
        await queryRunner.dropTable('users');
    }
}