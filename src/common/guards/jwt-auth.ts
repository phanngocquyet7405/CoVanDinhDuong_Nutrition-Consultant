import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/roles';

/**
 * JwtAuthGuard — Bảo vệ route bằng JWT
 *
 * Kế thừa AuthGuard('jwt') của Passport → dùng JwtStrategy để verify token.
 * Mở rộng thêm tính năng:
 *   1. Hỗ trợ @Public() → bỏ qua kiểm tra JWT cho route public
 *   2. Thông báo lỗi rõ ràng bằng tiếng Việt
 *
 * Cách dùng:
 *   // Áp dụng cho toàn controller:
 *   @UseGuards(JwtAuthGuard)
 *   @Controller('profile')
 *
 *   // Áp dụng cho một endpoint:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *
 *   // Đánh dấu public (không cần JWT):
 *   @Public()
 *   @Post('login')
 *
 * Thứ tự Pipeline:
 *   Middleware (AuthMiddleware decode) → Guard (JwtAuthGuard verify) → Controller
 *
 * Luồng khi request đến:
 *   1. Passport lấy token từ Authorization header
 *   2. Gọi JwtStrategy.validate() → trả về user object
 *   3. Gắn user vào req.user
 *   4. Guard trả về true → vào Controller
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Kiểm tra @Public() decorator — nếu có thì bỏ qua xác thực
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        // Delegate về AuthGuard('jwt') để verify token
        return super.canActivate(context);
    }

    /**
     * Override để tuỳ chỉnh thông báo lỗi
     * Passport gọi handleRequest sau khi validate xong
     */
    handleRequest<TUser = any>(
        err: any,
        user: TUser,
        info: any,
    ): TUser {
        if (err || !user) {
            // Token hết hạn
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token đã hết hạn — vui lòng đăng nhập lại');
            }
            // Token không hợp lệ
            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Token không hợp lệ');
            }
            // Không có token
            throw new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
        }
        return user;
    }
}