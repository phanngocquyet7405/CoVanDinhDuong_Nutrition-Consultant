import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DishFood } from '../../dish-food/entities/dish-food.entity';

@Entity('dishes')
export class Dish {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @OneToMany(() => DishFood, df => df.dish)
    foods: DishFood[];
}