import {
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

/**
 * errorHandlerMiddleware — Express error middleware (4 tham số)
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Đây là Express error middleware thuần (không phải NestMiddle) │
 * │  Vì NestMiddleware chỉ nhận 3 tham số (req, res, next)         │
 * │  Error middleware Express cần đúng 4 tham số: (err,req,res,next)│
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Đăng ký trong main.ts SAU app.listen:
 *   const app = await NestFactory.create(AppModule);
 *   app.use(errorHandlerMiddleware);  ← Express-level
 *
 * ── Xử lý các loại lỗi MySQL (TypeORM) ───────────────────────────
 *   ER_DUP_ENTRY (1062)          → 409 Conflict
 *   ER_NO_REFERENCED_ROW (1452)  → 400 Bad Request
 *   ER_DATA_TOO_LONG (1406)      → 400 Bad Request
 *   ER_BAD_NULL_ERROR (1048)     → 400 Bad Request
 *   EntityNotFoundError          → 404 Not Found
 *   SyntaxError (JSON parse)     → 400 Bad Request
 *   Mọi lỗi khác                 → 500 Internal Server Error
 */

const logger = new Logger('ErrorHandler');

/** Gửi response lỗi theo format chuẩn */
function sendError(
    res: Response,
    req: Request,
    status: number,
    message: string | string[],
): void {
    res.status(status).json({
        success: false,
        statusCode: status,
        message,
        path: req.url,
        method: req.method,
        requestId: (req as any).id,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Trích xuất tên field từ MySQL ER_DUP_ENTRY message
 * Format: "Duplicate entry 'value' for key 'table.column_name'"
 */
function extractDuplicateField(message: string): string {
    const match = message.match(/for key '[\w.]*\.(\w+)'/);
    if (match?.[1]) {
        return match[1].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return 'Dữ liệu';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandlerMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
): void {

    // ── TypeORM: Query thất bại (MySQL error) ──────────────────────
    if (err instanceof QueryFailedError) {
        const mysqlErr = err as any;
        const errCode = mysqlErr?.code ?? String(mysqlErr?.errno);

        logger.warn(`MySQL Error [${errCode}]: ${err.message} — ${req.method} ${req.url}`);

        if (errCode === 'ER_DUP_ENTRY' || mysqlErr?.errno === 1062) {
            const field = extractDuplicateField(err.message);
            return sendError(res, req, HttpStatus.CONFLICT, `${field} đã tồn tại trong hệ thống`);
        }
        if (errCode === 'ER_NO_REFERENCED_ROW_2' || mysqlErr?.errno === 1452) {
            return sendError(res, req, HttpStatus.BAD_REQUEST, 'Dữ liệu tham chiếu không tồn tại');
        }
        if (errCode === 'ER_DATA_TOO_LONG' || mysqlErr?.errno === 1406) {
            return sendError(res, req, HttpStatus.BAD_REQUEST, 'Dữ liệu vượt quá độ dài cho phép');
        }
        if (errCode === 'ER_BAD_NULL_ERROR' || mysqlErr?.errno === 1048) {
            return sendError(res, req, HttpStatus.BAD_REQUEST, 'Thiếu dữ liệu bắt buộc');
        }
        if (errCode === 'ER_TRUNCATED_WRONG_VALUE' || mysqlErr?.errno === 1292) {
            return sendError(res, req, HttpStatus.BAD_REQUEST, 'Giá trị không hợp lệ cho trường dữ liệu');
        }
        return sendError(res, req, HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi cơ sở dữ liệu');
    }

    // ── TypeORM: Entity không tìm thấy ────────────────────────────
    if (err instanceof EntityNotFoundError) {
        return sendError(res, req, HttpStatus.NOT_FOUND, 'Không tìm thấy dữ liệu');
    }

    // ── NestJS HttpException ───────────────────────────────────────
    if (err instanceof HttpException) {
        const raw = err.getResponse();
        const status = err.getStatus();
        const msg = typeof raw === 'object' && raw !== null && 'message' in raw
            ? (raw as any).message
            : typeof raw === 'string' ? raw : 'Lỗi không xác định';
        return sendError(res, req, status, msg);
    }

    // ── SyntaxError khi parse JSON body ───────────────────────────
    if (err instanceof SyntaxError && 'body' in (err as any)) {
        return sendError(res, req, HttpStatus.BAD_REQUEST, 'Request body không đúng định dạng JSON');
    }

    // ── Lỗi không xác định → 500 ──────────────────────────────────
    const isDev = process.env.NODE_ENV === 'development';
    logger.error(`Unhandled: ${req.method} ${req.url}`, (err as any)?.stack);

    return sendError(
        res, req,
        HttpStatus.INTERNAL_SERVER_ERROR,
        isDev
            ? `Internal Server Error: ${(err as Error)?.message}`
            : 'Lỗi hệ thống — vui lòng thử lại sau',
    );
}