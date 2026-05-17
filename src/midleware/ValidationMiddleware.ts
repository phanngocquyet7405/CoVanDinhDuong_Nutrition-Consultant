import {
    Injectable,
    NestMiddleware,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

/**
 * ValidationMiddleware — Factory middleware validate request body / params / query
 * bằng Joi schema ở tầng middleware (trước khi vào Controller).
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Khác biệt với ValidationPipe (class-validator trên DTO):      │
 * │                                                                 │
 * │  ValidationPipe (DTO) → validate khi request vào Controller,   │
 * │                          dựa trên decorator @IsString()...     │
 * │                          DÙNG CHO: JSON body từ API client      │
 * │                                                                 │
 * │  ValidationMiddleware → validate TRƯỚC Controller              │
 * │                          dựa trên Joi schema động              │
 * │                          DÙNG CHO: form data, query string,    │
 * │                          hoặc cần validate nhiều phần cùng lúc │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Cách dùng — tạo middleware cụ thể từ factory:
 *
 *   // Tạo validator cho profile
 *   export const ProfileValidationMiddleware =
 *     ValidationMiddleware.forSchema(profileSchema, 'body');
 *
 *   // Đăng ký trong module
 *   export class ProfileModule implements NestModule {
 *     configure(consumer: MiddlewareConsumer) {
 *       consumer
 *         .apply(ProfileValidationMiddleware)
 *         .forRoutes({ path: 'profile', method: RequestMethod.PUT });
 *     }
 *   }
 */
@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    private readonly logger = new Logger(ValidationMiddleware.name);

    constructor(
        private readonly schema: ObjectSchema,
        private readonly target: 'body' | 'query' | 'params' = 'body',
    ) { }

    use(req: Request, _res: Response, next: NextFunction): void {
        const data = req[this.target];

        const { error, value } = this.schema.validate(data, {
            abortEarly: false,    // Thu thập TẤT CẢ lỗi, không dừng ở lỗi đầu tiên
            stripUnknown: true,   // Bỏ qua field không có trong schema (an toàn hơn)
            convert: true,        // Tự convert string → number nếu schema khai báo number
        });

        if (error) {
            // Gom tất cả lỗi thành mảng message rõ ràng
            const messages = error.details.map((d) => d.message.replace(/['"]/g, ''));
            this.logger.debug(
                `Validation failed [${this.target}]: ${messages.join(' | ')}`,
            );
            throw new BadRequestException(messages);
        }

        // Gán lại data đã được clean/convert bởi Joi
        (req as any)[this.target] = value;
        next();
    }

    /**
     * Factory method — tạo middleware class với schema và target cụ thể
     *
     * @param schema  Joi ObjectSchema để validate
     * @param target  Phần của request cần validate: 'body' | 'query' | 'params'
     *
     * @example
     *   const ValidateBody   = ValidationMiddleware.forSchema(mySchema, 'body');
     *   const ValidateQuery  = ValidationMiddleware.forSchema(searchSchema, 'query');
     *   const ValidateParams = ValidationMiddleware.forSchema(idSchema, 'params');
     */
    static forSchema(
        schema: ObjectSchema,
        target: 'body' | 'query' | 'params' = 'body',
    ): new (...args: any[]) => NestMiddleware {
        @Injectable()
        class ConcreteValidationMiddleware extends ValidationMiddleware {
            constructor() {
                super(schema, target);
            }
        }
        return ConcreteValidationMiddleware;
    }
}