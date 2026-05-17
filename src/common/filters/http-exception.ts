import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter — Bắt và format tất cả exception thành JSON chuẩn
 *
 * @Catch() không có tham số → bắt MỌI exception (kể cả lỗi không phải HTTP)
 *
 * Format response lỗi:
 * {
 *   "success":    false,
 *   "statusCode": 404,
 *   "message":    "User #5 không tồn tại",
 *   "path":       "/api/v1/users/5",
 *   "method":     "GET",
 *   "requestId":  "abc-123",
 *   "timestamp":  "2024-06-01T07:00:00.000Z"
 * }
 *
 * Đăng ký global trong main.ts:
 *   app.useGlobalFilters(new HttpExceptionFilter());
 *
 * Phân công nhiệm vụ:
 *   - HttpExceptionFilter bắt lỗi từ Controller/Service/Guard/Pipe
 *   - errorHandlerMiddleware (middleware/) bắt lỗi TypeORM và JSON parse
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        // ── Xác định status code ─────────────────────────────────────
        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // ── Trích xuất message ────────────────────────────────────────
        let message: string | string[];

        if (exception instanceof HttpException) {
            const raw = exception.getResponse();

            if (typeof raw === 'string') {
                message = raw;
            } else if (typeof raw === 'object' && raw !== null) {
                // NestJS ValidationPipe trả về { message: string[] }
                // Custom exception trả về { message: string }
                message = (raw as any).message ?? 'Lỗi không xác định';
            } else {
                message = 'Lỗi không xác định';
            }
        } else {
            message = 'Internal server error';
        }

        // ── Log lỗi nghiêm trọng (5xx) ───────────────────────────────
        if (status >= 500) {
            this.logger.error(
                `${req.method} ${req.url} → ${status}`,
                (exception as Error)?.stack,
            );
        } else if (status >= 400) {
            this.logger.warn(`${req.method} ${req.url} → ${status}: ${JSON.stringify(message)}`);
        }

        // ── Gửi response chuẩn ────────────────────────────────────────
        res.status(status).json({
            success: false,
            statusCode: status,
            message,
            path: req.url,
            method: req.method,
            requestId: (req as any).id,        // Gắn bởi RequestIdMiddleware
            timestamp: new Date().toISOString(),
        });
    }
}