import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DishFood } from '../../dish-food/entities/dish-food.entity';

@Entity('foods')
export class Food {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    /**
     * Phân loại: 'Protein' | 'Tinh bột' | 'Rau củ' | 'Khác'
     * nullable: true → không bắt buộc khi insert
     */
    @Column({ type: 'varchar', length: 50, nullable: true })
    category: string;

    /**
     * Đơn vị tính — hiển thị "per <unit>" trong Food.tsx
     */
    @Column({ type: 'varchar', length: 20, default: '100g' })
    unit: string;

    @Column({ type: 'float' })
    calories: number;

    @Column({ type: 'float' })
    protein: number;

    @Column({ type: 'float' })
    carbs: number;

    @Column({ type: 'float' })
    fat: number;

    @Column({ type: 'float' })
    cost: number;

    @OneToMany(() => DishFood, df => df.food)
    dishes: DishFood[];
}