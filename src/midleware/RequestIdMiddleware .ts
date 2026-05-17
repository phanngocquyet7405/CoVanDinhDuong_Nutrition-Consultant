import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Mở rộng Express Request để TypeScript nhận biết req.id
 * Khai báo global một lần — dùng được ở toàn bộ project
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            id?: string;
        }
    }
}

/**
 * RequestIdMiddleware — Gán UUID duy nhất cho mỗi request
 *
 * Mỗi request nhận một ID duy nhất (UUID v4) để:
 *   1. Trace log từ đầu đến cuối một request
 *   2. Debug khi có nhiều request đồng thời
 *   3. Client nhận ID qua header X-Request-Id để báo lỗi
 *
 * Logic:
 *   - Nếu client đã gửi X-Request-Id header → dùng lại (idempotent)
 *   - Nếu không có → tự sinh UUID v4 mới
 *
 * Đăng ký ĐẦU TIÊN trong middleware chain:
 *   consumer.apply(RequestIdMiddleware, LoggerMiddleware, ...).forRoutes('*');
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        // Tái sử dụng requestId từ client nếu có (hữu ích khi debug distributed)
        const id = (req.headers['x-request-id'] as string) || randomUUID();

        req.id = id;

        // Gắn vào response header để client nhận được để debug
        res.setHeader('X-Request-Id', id);

        next();
    }
}