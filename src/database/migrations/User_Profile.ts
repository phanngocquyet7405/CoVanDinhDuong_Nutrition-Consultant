import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

/**
 * Migration 002 — Tạo bảng user_profiles
 *
 * Lưu thông tin sức khoẻ của người dùng (1:1 với users).
 * Tách khỏi bảng users để giữ users nhỏ gọn và bảo vệ dữ liệu nhạy cảm.
 *
 * Cột tính toán (được service tính và lưu khi upsert):
 *   bmi  = weight / (height/100)²
 *   bmr  = Mifflin-St Jeor equation
 *   tdee = bmr × activity multiplier
 *
 * Quan hệ:
 *   user_profiles.user_id → users.id (CASCADE DELETE)
 */
export class CreateUserProfilesTable implements MigrationInterface {
    public name = 'CreateUserProfilesTable1700000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_profiles',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        unsigned: true,
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                        unsigned: true,
                        isUnique: true,        // 1 user chỉ có 1 profile
                        comment: 'FK → users.id',
                    },

                    // ── Thông tin cơ bản ────────────────────────────────────
                    {
                        name: 'gender',
                        type: 'enum',
                        enum: ['male', 'female', 'other'],
                        comment: 'Giới tính ảnh hưởng đến công thức BMR',
                    },
                    {
                        name: 'age',
                        type: 'tinyint',
                        unsigned: true,
                        comment: 'Tuổi (1–120)',
                    },
                    {
                        name: 'height_cm',
                        type: 'smallint',
                        unsigned: true,
                        comment: 'Chiều cao (cm)',
                    },
                    {
                        name: 'weight_kg',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        comment: 'Cân nặng (kg) — decimal để lưu 0.5kg',
                    },

                    // ── Mức độ hoạt động thể chất ───────────────────────────
                    {
                        name: 'activity_level',
                        type: 'enum',
                        enum: [
                            'sedentary',          // Ít vận động, làm văn phòng
                            'lightly_active',     // Nhẹ: 1–3 buổi/tuần
                            'moderately_active',  // Vừa: 3–5 buổi/tuần
                            'very_active',        // Nhiều: 6–7 buổi/tuần
                            'extra_active',       // Rất nhiều: 2 buổi/ngày hoặc lao động nặng
                        ],
                        default: "'sedentary'",
                        comment: 'Ảnh hưởng TDEE multiplier (1.2 → 1.9)',
                    },

                    // ── Mục tiêu dinh dưỡng ─────────────────────────────────
                    {
                        name: 'goal',
                        type: 'enum',
                        enum: [
                            'weight_loss',      // Giảm cân
                            'weight_gain',      // Tăng cân
                            'maintain_weight',  // Duy trì cân nặng
                            'muscle_gain',      // Tăng cơ
                            'improve_health',   // Cải thiện sức khoẻ chung
                        ],
                        default: "'maintain_weight'",
                        comment: 'Quyết định preset AHP weights và LP constraints',
                    },

                    // ── Hạn chế ăn uống (JSON array) ────────────────────────
                    {
                        name: 'allergies',
                        type: 'json',
                        isNullable: true,
                        comment: 'Danh sách dị ứng: ["shrimp", "peanuts", "dairy"]',
                    },
                    {
                        name: 'medical_conditions',
                        type: 'json',
                        isNullable: true,
                        comment: 'Bệnh lý: ["diabetes", "hypertension"]',
                    },
                    {
                        name: 'dietary_restrictions',
                        type: 'json',
                        isNullable: true,
                        comment: 'Kiêng kị: ["vegetarian", "halal", "gluten-free"]',
                    },

                    // ── Chỉ số tính toán — service tự cập nhật ──────────────
                    {
                        name: 'bmi',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0,
                        comment: 'Body Mass Index = weight/(height/100)²',
                    },
                    {
                        name: 'bmr',
                        type: 'decimal',
                        precision: 7,
                        scale: 2,
                        default: 0,
                        comment: 'Basal Metabolic Rate (kcal/ngày) — Mifflin-St Jeor',
                    },
                    {
                        name: 'tdee',
                        type: 'decimal',
                        precision: 7,
                        scale: 2,
                        default: 0,
                        comment: 'Total Daily Energy Expenditure = BMR × activity multiplier',
                    },

                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // FK: user_profiles.user_id → users.id
        await queryRunner.createForeignKey(
            'user_profiles',
            new TableForeignKey({
                name: 'FK_USER_PROFILES_USER',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',   // Xoá user → xoá profile theo
                onUpdate: 'CASCADE',
            }),
        );

        // Index tăng tốc lookup profile theo user_id
        await queryRunner.createIndex(
            'user_profiles',
            new TableIndex({
                name: 'IDX_PROFILE_USER_ID',
                columnNames: ['user_id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('user_profiles', 'FK_USER_PROFILES_USER');
        await queryRunner.dropIndex('user_profiles', 'IDX_PROFILE_USER_ID');
        await queryRunner.dropTable('user_profiles');
    }
}