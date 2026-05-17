import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * AppThrottlerGuard — Rate limiting theo IP
 *
 * Kế thừa ThrottlerGuard để tuỳ chỉnh thông báo lỗi khi vượt giới hạn.
 * Cấu hình TTL/limit đặt trong ThrottlerModule.forRoot() trong app.module.ts.
 *
 * Mặc định: 60 request / phút / IP
 *
 * Cách dùng:
 *   // Global (áp dụng cho toàn app — đăng ký trong main.ts):
 *   app.useGlobalGuards(new ThrottlerGuard(...));
 *
 *   // Controller-level (route đặc biệt cần rate limit riêng):
 *   @UseGuards(AppThrottlerGuard)
 *   @Throttle({ default: { ttl: 60000, limit: 5 } })
 *   @Post('auth/login')
 *   login() { ... }
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
    protected async getErrorMessage(): Promise<string> {
        return 'Quá nhiều yêu cầu — vui lòng chờ một lúc rồi thử lại';
    }
}