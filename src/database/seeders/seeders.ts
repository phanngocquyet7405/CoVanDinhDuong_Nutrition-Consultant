import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

export class CreateRecommendationsTable1700000006 implements MigrationInterface {
    public name = 'CreateRecommendationsTable1700000006';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'recommendations',
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
                        name: 'meal_plan_id',
                        type: 'int',
                        unsigned: true,
                        isNullable: true,
                        comment: 'FK → meal_plans.id (nếu gợi ý gắn với 1 kế hoạch cụ thể)',
                    },

                    // ── Loại gợi ý ──────────────────────────────────────────
                    {
                        name: 'type',
                        type: 'enum',
                        enum: [
                            'food_swap',         // Thay thế một món cụ thể
                            'meal_plan',         // Tạo kế hoạch mới cho cả tuần
                            'daily_adjustment',  // Điều chỉnh hôm nay
                            'deficit_fix',       // Bù thiếu hụt dinh dưỡng
                        ],
                        comment: 'Loại gợi ý DSS',
                    },

                    // ── Kết quả AHP ──────────────────────────────────────────
                    {
                        name: 'criteria',
                        type: 'json',
                        comment: 'Tiêu chí và trọng số AHP: [{ name, weight, isBenefit }]',
                    },
                    {
                        name: 'ahp_cr',
                        type: 'decimal',
                        precision: 6,
                        scale: 4,
                        default: 0,
                        comment: 'Consistency Ratio AHP — hợp lệ nếu CR < 0.1',
                    },
                    {
                        name: 'ahp_matrix',
                        type: 'json',
                        isNullable: true,
                        comment: 'Ma trận so sánh cặp n×n (lưu để audit)',
                    },

                    // ── Kết quả TOPSIS ────────────────────────────────────────
                    {
                        name: 'alternatives',
                        type: 'json',
                        comment: 'Danh sách thực phẩm được xếp hạng TOPSIS',
                    },
                    {
                        name: 'topsis_positive',
                        type: 'json',
                        isNullable: true,
                        comment: 'Giải pháp lý tưởng tích cực A+: { protein: 0.42, ... }',
                    },
                    {
                        name: 'topsis_negative',
                        type: 'json',
                        isNullable: true,
                        comment: 'Giải pháp lý tưởng tiêu cực A-: { protein: 0.05, ... }',
                    },

                    // ── Kết quả Linear Programming ────────────────────────────
                    {
                        name: 'lp_constraints',
                        type: 'json',
                        isNullable: true,
                        comment: 'Mô tả ràng buộc LP: ["Calories: 1500–1800 kcal", "Protein ≥ 120g"]',
                    },
                    {
                        name: 'lp_optimal',
                        type: 'decimal',
                        precision: 10,
                        scale: 4,
                        isNullable: true,
                        comment: 'Giá trị hàm mục tiêu tối ưu LP',
                    },
                    {
                        name: 'lp_solution',
                        type: 'json',
                        isNullable: true,
                        comment: 'Lượng ăn tối ưu: { "foodId": gramAmount }',
                    },

                    // ── Kết quả tổng hợp ────────────────────────────────────
                    {
                        name: 'top_food_ids',
                        type: 'json',
                        isNullable: true,
                        comment: 'Danh sách food.id top 5 được gợi ý: [3, 7, 12, 5, 9]',
                    },
                    {
                        name: 'explanation',
                        type: 'text',
                        comment: 'Giải thích kết quả bằng ngôn ngữ tự nhiên cho người dùng',
                    },

                    // ── Snapshot trạng thái người dùng lúc recommend ────────
                    {
                        name: 'user_tdee',
                        type: 'decimal',
                        precision: 7,
                        scale: 2,
                        comment: 'TDEE người dùng tại thời điểm recommend (kcal/ngày)',
                    },
                    {
                        name: 'user_goal',
                        type: 'varchar',
                        length: '50',
                        comment: 'Mục tiêu lúc recommend (weight_loss | muscle_gain | ...)',
                    },
                    {
                        name: 'user_bmi',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        comment: 'BMI người dùng tại thời điểm recommend',
                    },

                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        comment: 'Thời điểm tạo gợi ý (không có updated_at vì immutable)',
                    },
                ],
            }),
            true,
        );

        // FK → users
        await queryRunner.createForeignKey(
            'recommendations',
            new TableForeignKey({
                name: 'FK_RECOMMENDATIONS_USER',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        // FK → meal_plans (nullable)
        await queryRunner.createForeignKey(
            'recommendations',
            new TableForeignKey({
                name: 'FK_RECOMMENDATIONS_MEAL_PLAN',
                columnNames: ['meal_plan_id'],
                referencedTableName: 'meal_plans',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',  // Xoá meal_plan → không xoá recommendation
                onUpdate: 'CASCADE',
            }),
        );

        // Index: lịch sử gợi ý của user (sort by created_at DESC)
        await queryRunner.createIndex(
            'recommendations',
            new TableIndex({
                name: 'IDX_REC_USER_CREATED',
                columnNames: ['user_id', 'created_at'],
            }),
        );

        // Index: lọc theo loại gợi ý
        await queryRunner.createIndex(
            'recommendations',
            new TableIndex({
                name: 'IDX_REC_TYPE',
                columnNames: ['type'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('recommendations', 'FK_RECOMMENDATIONS_MEAL_PLAN');
        await queryRunner.dropForeignKey('recommendations', 'FK_RECOMMENDATIONS_USER');
        await queryRunner.dropIndex('recommendations', 'IDX_REC_USER_CREATED');
        await queryRunner.dropIndex('recommendations', 'IDX_REC_TYPE');
        await queryRunner.dropTable('recommendations');
    }
}