import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * AppValidationPipe — Validate DTO dùng class-validator
 *
 * Thay thế ValidationPipe mặc định của NestJS với thông báo lỗi tiếng Việt
 * và log debug chi tiết hơn.
 *
 * Tính năng:
 *   - whitelist: true    → tự động bỏ field không có trong DTO class
 *   - transform: true    → chuyển đổi kiểu dữ liệu theo @Type() decorator
 *   - Thông báo lỗi: gom thành mảng string rõ ràng
 *
 * Đăng ký global trong main.ts:
 *   app.useGlobalPipes(new AppValidationPipe());
 *
 * (Hoặc dùng ValidationPipe built-in của NestJS với options tương tự —
 * pipe này hữu ích khi cần tuỳ chỉnh thêm behavior)
 */
@Injectable()
export class AppValidationPipe implements PipeTransform<any> {
    private readonly logger = new Logger(AppValidationPipe.name);

    async transform(value: any, { metatype }: ArgumentMetadata) {
        // Bỏ qua nếu không có metatype hoặc là kiểu nguyên thủy
        if (!metatype || !this.needsValidation(metatype)) {
            return value;
        }

        // Chuyển plain object → instance của DTO class
        const object = plainToInstance(metatype, value, {
            enableImplicitConversion: true,   // string → number tự động
            excludeExtraneousValues: false,
        });

        // Validate với class-validator decorators
        const errors = await validate(object, {
            whitelist: true,   // Bỏ field không có trong DTO
            forbidNonWhitelisted: true,   // Throw lỗi nếu có field lạ
            skipMissingProperties: false,
        });

        if (errors.length > 0) {
            // Gom tất cả lỗi constraints thành mảng message phẳng
            const messages = errors.flatMap((err) =>
                Object.values(err.constraints ?? {}).map((msg) => msg),
            );

            this.logger.debug(`Validation errors: ${messages.join(' | ')}`);
            throw new BadRequestException(messages);
        }

        return object;
    }

    /** Kiểm tra có cần validate không — bỏ qua kiểu nguyên thủy */
    private needsValidation(metatype: Function): boolean {
        const skip = [String, Boolean, Number, Array, Object];
        return !skip.includes(metatype as any);
    }
}