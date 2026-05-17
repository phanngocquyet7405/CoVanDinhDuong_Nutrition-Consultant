import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * ResponseInterceptor — Bọc tất cả response thành format chuẩn
 *
 * Mọi response thành công đều có dạng:
 * {
 *   "success":    true,
 *   "statusCode": 200,
 *   "data":       { ... },          ← dữ liệu thực tế từ Controller
 *   "timestamp":  "2024-06-01T..."
 * }
 *
 * Lý do dùng interceptor thay vì wrapper thủ công:
 *   - Không cần return { success: true, data: result } trong mỗi Controller
 *   - Đảm bảo format nhất quán 100% — không có exception
 *   - Lỗi vẫn qua HttpExceptionFilter (interceptor không bắt lỗi)
 *
 * Đăng ký global trong main.ts:
 *   app.useGlobalInterceptors(new ResponseInterceptor());
 */
@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ApiWrappedResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiWrappedResponse<T>> {
        // Lấy status code thực tế (201 cho POST, 200 cho GET...)
        const statusCode = context
            .switchToHttp()
            .getResponse()
            .statusCode as number;

        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode,
                data,
                timestamp: new Date().toISOString(),
            })),
        );
    }
}

/** Type của response đã được wrap */
export interface ApiWrappedResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
}