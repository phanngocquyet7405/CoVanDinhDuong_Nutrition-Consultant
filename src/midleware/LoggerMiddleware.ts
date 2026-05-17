import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LoggerMiddleware — Ghi log mọi HTTP request
 *
 * Log format:
 *   GET /api/v1/foods 200 — 45ms [::1] Mozilla/5.0... [req-abc123]
 *   POST /api/v1/auth/login 401 — 12ms [::1] ... [req-xyz789]
 *   GET /api/v1/unknown 500 — 3ms [::1] ... [req-def456]
 *
 * Đăng ký SAU RequestIdMiddleware để có requestId trong log:
 *   consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') ?? '-';
        const requestId = (req as any).id ?? '-';
        const start = Date.now();

        res.on('finish', () => {
            const ms = Date.now() - start;
            const { statusCode } = res;
            const icon = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';

            this.logger.log(
                `${icon} ${method} ${originalUrl} ${statusCode} — ${ms}ms [${ip}] [${requestId}]`,
            );

            // Log chi tiết user-agent ở debug mode
            this.logger.debug(`User-Agent: ${userAgent}`);
        });

        next();
    }
}