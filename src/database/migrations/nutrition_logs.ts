import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
    TableUnique,
} from 'typeorm';

/**
 * Migration 005 — Tạo bảng nutrition_logs
 *
 * Nhật ký dinh dưỡng hàng ngày của người dùng.
 * Mỗi user chỉ có 1 bản ghi mỗi ngày (unique constraint user_id + date).
 *
 * meals (JSON) — danh sách bữa ăn trong ngày:
 * [
 *   {
 *     type: "breakfast",           // breakfast | lunch | dinner | snack
 *     loggedAt: "2024-06-01T07:30:00Z",
 *     items: [
 *       {
 *         foodId: 1,
 *         foodName: "Cơm trắng",
 *         amountG: 200,            // gram thực tế ăn
 *         calories: 260,           // = 130 * 200/100
 *         protein: 5.4,
 *         carbohydrates: 56.4,
 *         fat: 0.6
 *       }
 *     ]
 *   }
 * ]
 *
 * total_* được service tính lại mỗi lần update log.
 */
export class CreateNutritionLogsTable implements MigrationInterface {
    public name = 'CreateNutritionLogsTable1700000005';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'nutrition_logs',
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
                        comment: 'FK → users.id',
                    },
                    {
                        name: 'date',
                        type: 'date',
                        comment: 'Ngày ghi nhật ký (YYYY-MM-DD) — không lưu giờ',
                    },

                    // ── Dữ liệu bữa ăn (JSON) ──────────────────────────────
                    {
                        name: 'meals',
                        type: 'json',
                        comment: 'Danh sách bữa ăn trong ngày — xem cấu trúc trong JSDoc',
                    },

                    // ── Theo dõi nước uống ──────────────────────────────────
                    {
                        name: 'water_intake_ml',
                        type: 'int',
                        unsigned: true,
                        default: 0,
                        comment: 'Lượng nước uống trong ngày (ml)',
                    },

                    // ── Tổng dinh dưỡng trong ngày (service tính) ───────────
                    {
                        name: 'total_calories',
                        type: 'decimal',
                        precision: 7,
                        scale: 2,
                        default: 0,
                        comment: 'Tổng calories trong ngày (kcal)',
                    },
                    {
                        name: 'total_protein',
                        type: 'decimal',
                        precision: 6,
                        scale: 2,
                        default: 0,
                        comment: 'Tổng protein trong ngày (g)',
                    },
                    {
                        name: 'total_carbs',
                        type: 'decimal',
                        precision: 6,
                        scale: 2,
                        default: 0,
                        comment: 'Tổng carbohydrate trong ngày (g)',
                    },
                    {
                        name: 'total_fat',
                        type: 'decimal',
                        precision: 6,
                        scale: 2,
                        default: 0,
                        comment: 'Tổng chất béo trong ngày (g)',
                    },

                    // ── Ghi chú và cảm xúc ─────────────────────────────────
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                        comment: 'Ghi chú tự do của người dùng',
                    },
                    {
                        name: 'mood',
                        type: 'enum',
                        enum: ['great', 'good', 'neutral', 'bad'],
                        isNullable: true,
                        comment: 'Tâm trạng trong ngày — dùng để phân tích tương quan',
                    },
                    {
                        name: 'energy_level',
                        type: 'tinyint',
                        unsigned: true,
                        isNullable: true,
                        comment: 'Mức năng lượng cảm nhận (1–5)',
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

                // ── Unique constraint: 1 log per user per day ─────────────
                uniques: [
                    new TableUnique({
                        name: 'UQ_NUTRITION_LOG_USER_DATE',
                        columnNames: ['user_id', 'date'],
                    }),
                ],
            }),
            true,
        );

        // FK → users
        await queryRunner.createForeignKey(
            'nutrition_logs',
            new TableForeignKey({
                name: 'FK_NUTRITION_LOGS_USER',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        // Index: lấy log theo user + khoảng thời gian (báo cáo, lịch sử)
        await queryRunner.createIndex(
            'nutrition_logs',
            new TableIndex({
                name: 'IDX_LOG_USER_DATE',
                columnNames: ['user_id', 'date'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('nutrition_logs', 'FK_NUTRITION_LOGS_USER');
        await queryRunner.dropIndex('nutrition_logs', 'IDX_LOG_USER_DATE');
        await queryRunner.dropTable('nutrition_logs');
    }
}