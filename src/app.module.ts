import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
=======
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { FoodModule } from './food/food.module';
import { DishModule } from './dish/dish.module';
import { CriteriaModule } from './criteria/criteria.module';

import { AhpModule } from './ahp/ahp.module';
import { TopsisModule } from './topsis/topsis.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { DishFoodModule } from './dish-food/dish-food.module';
>>>>>>> ec694c1 (feat:update modules in backend NT)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
<<<<<<< HEAD
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

=======

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'mysql',

        host: config.get<string>('DB_HOST'),

        port: config.get<number>('DB_PORT'),

        username: config.get<string>('DB_USER'),

        password: config.get<string>('DB_PASSWORD'),

        database: config.get<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),

    FoodModule,
    DishModule,
    CriteriaModule,

    AhpModule,
    TopsisModule,
    RecommendationModule,
    DishFoodModule,
  ],
})
export class AppModule { }
>>>>>>> ec694c1 (feat:update modules in backend NT)
