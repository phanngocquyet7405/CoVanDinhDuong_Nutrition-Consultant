import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * LoggingInterceptor — Đo thời gian xử lý request ở tầng Controller/Service
 *
 * Khác với LoggerMiddleware (đo toàn bộ pipeline kể cả middleware):
 *   LoggingInterceptor đo thời gian từ khi vào Controller đến khi response xong.
 *   Dùng để phát hiện Controller/Service xử lý chậm.
 *
 * Chỉ bật ở development mode để tránh overhead ở production.
 * Đăng ký trong main.ts (tuỳ chọn — thêm sau ResponseInterceptor):
 *   if (isDev) app.useGlobalInterceptors(new LoggingInterceptor());
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('Controller');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;
        const handler = context.getHandler().name;
        const className = context.getClass().name;
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - start;
                this.logger.debug(
                    `${method} ${url} → ${className}.${handler}() — ${ms}ms`,
                );
            }),
        );
    }
}