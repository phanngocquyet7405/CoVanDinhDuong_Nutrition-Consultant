import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { Dish } from '../../dish/entities/dish.entity';
import { Food } from '../../food/entities/food.entity';

@Entity('dish_food')
export class DishFood {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('float')
    quantity: number;

    @ManyToOne(() => Dish, dish => dish.foods, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'dish_id' })
    dish: Dish;

    @ManyToOne(() => Food, food => food.dishes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'food_id' })
    food: Food;
}