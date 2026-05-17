import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

/**
 * Migration 004 — Tạo bảng meal_plans
 *
 * Lưu kế hoạch ăn uống hàng tuần được tạo bởi hệ thống DSS (AHP+TOPSIS+LP)
 * hoặc do người dùng tự tạo thủ công.
 *
 * week_plan (JSON) — cấu trúc:
 * [
 *   {
 *     dayOfWeek: 1,          // 0=CN, 1=T2, ..., 6=T7
 *     meals: [
 *       {
 *         type: "breakfast",
 *         items: [{ foodId, foodName, amountG, calories, protein, carbs, fat }],
 *         totalCalories: 450
 *       }
 *     ],
 *     totalCalories: 1800
 *   }
 * ]
 *
 * Lưu cả kết quả thuật toán (ahp_weights, topsis_score, lp_objective_value)
 * để phân tích và audit về sau.
 */
export class CreateMealPlansTable implements MigrationInterface {
    public name = 'CreateMealPlansTable1700000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'meal_plans',
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

                    // ── Thông tin kế hoạch ──────────────────────────────────
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '200',
                        comment: 'Tên kế hoạch — VD: "Giảm cân tuần 1 tháng 6"',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                        comment: 'Ghi chú thêm về kế hoạch',
                    },

                    // ── Dữ liệu bữa ăn theo tuần (JSON) ────────────────────
                    {
                        name: 'week_plan',
                        type: 'json',
                        comment: 'Kế hoạch 7 ngày — xem cấu trúc trong JSDoc',
                    },

                    // ── Mục tiêu dinh dưỡng (g/ngày) ───────────────────────
                    {
                        name: 'target_calories',
                        type: 'decimal',
                        precision: 7,
                        scale: 2,
                        comment: 'Mục tiêu calories/ngày (kcal)',
                    },
                    {
                        name: 'target_protein',
                        type: 'decimal',
                        precision: 6,
                        scale: 2,
                        comment: 'Mục tiêu protein/ngày (g)',
                    },
                    {
                        name: 'target_carbs',
                        type: 'decimal',
                        precision: 6,
                        scale: 2,
                        comment: 'Mục tiêu carbohydrate/ngày (g)',
                    },
                    {
                        name: 'target_fat',
                        type: 'decimal',
                        precision: 6,
                        scale: 2,
                        comment: 'Mục tiêu chất béo/ngày (g)',
                    },

                    // ── Thông tin thuật toán DSS ────────────────────────────
                    {
                        name: 'algorithm_used',
                        type: 'enum',
                        enum: ['AHP', 'TOPSIS', 'LP', 'hybrid'],
                        default: "'hybrid'",
                        comment: 'Thuật toán đã dùng để tạo kế hoạch này',
                    },
                    {
                        name: 'ahp_weights',
                        type: 'json',
                        isNullable: true,
                        comment: 'Trọng số AHP từng tiêu chí: { calories: 0.35, protein: 0.30, ... }',
                    },
                    {
                        name: 'topsis_score',
                        type: 'decimal',
                        precision: 5,
                        scale: 4,
                        isNullable: true,
                        comment: 'Điểm TOPSIS tổng hợp của kế hoạch (0–1)',
                    },
                    {
                        name: 'lp_objective_value',
                        type: 'decimal',
                        precision: 10,
                        scale: 4,
                        isNullable: true,
                        comment: 'Giá trị hàm mục tiêu LP (objective function value)',
                    },

                    // ── Trạng thái và thời hạn ──────────────────────────────
                    {
                        name: 'is_active',
                        type: 'tinyint',
                        width: 1,
                        default: 1,
                        comment: 'Kế hoạch đang áp dụng (1) hay đã lưu trữ (0)',
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                        isNullable: true,
                        comment: 'Ngày bắt đầu áp dụng kế hoạch',
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                        isNullable: true,
                        comment: 'Ngày kết thúc kế hoạch',
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

        // FK → users
        await queryRunner.createForeignKey(
            'meal_plans',
            new TableForeignKey({
                name: 'FK_MEAL_PLANS_USER',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        // Index: lấy kế hoạch của một user (query phổ biến nhất)
        await queryRunner.createIndex(
            'meal_plans',
            new TableIndex({
                name: 'IDX_MEAL_PLANS_USER_ACTIVE',
                columnNames: ['user_id', 'is_active'],
            }),
        );

        // Index: lọc kế hoạch theo thời gian
        await queryRunner.createIndex(
            'meal_plans',
            new TableIndex({
                name: 'IDX_MEAL_PLANS_DATES',
                columnNames: ['start_date', 'end_date'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('meal_plans', 'FK_MEAL_PLANS_USER');
        await queryRunner.dropIndex('meal_plans', 'IDX_MEAL_PLANS_USER_ACTIVE');
        await queryRunner.dropIndex('meal_plans', 'IDX_MEAL_PLANS_DATES');
        await queryRunner.dropTable('meal_plans');
    }
}