import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, RequestUser } from '../shared/types';

/**
 * AuthMiddleware — Xác thực JWT token sớm ở tầng middleware
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Khác biệt với JwtAuthGuard (common/guards/jwt-auth.guard.ts): │
 * │                                                                 │
 * │  JwtAuthGuard  → NestJS Guard, dùng @UseGuards() trên từng     │
 * │                  controller/route, bảo vệ từng endpoint cụ thể  │
 * │                                                                 │
 * │  AuthMiddleware → chạy TRƯỚC Guards trên mọi request,          │
 * │                   decode token nếu có và gắn user vào req,      │
 * │                   KHÔNG throw lỗi nếu không có token            │
 * │                   (để route public vẫn hoạt động bình thường)   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Luồng hoạt động:
 *  1. Lấy token từ Authorization header (Bearer <token>)
 *  2. Verify token với JWT_SECRET
 *  3. Gắn decoded user vào req.user
 *  4. Nếu không có token → next() bình thường (route public tự xử lý)
 *  5. Nếu token hết hạn hoặc sai → throw UnauthorizedException
 *
 * Đăng ký trong AppModule:
 *   consumer.apply(RequestIdMiddleware, LoggerMiddleware, AuthMiddleware)
 *            .forRoutes('*');
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly logger = new Logger(AuthMiddleware.name);

    constructor(private readonly configService: ConfigService) { }

    use(req: Request, _res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        // Không có Authorization header → route public, bỏ qua
        if (!authHeader) {
            return next();
        }

        // Kiểm tra đúng format "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            throw new UnauthorizedException(
                'Authorization header không đúng định dạng. Dùng: Bearer <token>',
            );
        }

        const token = parts[1];

        try {
            const secret = this.configService.get<string>('JWT_SECRET')!;

            // Verify và decode token
            const decoded = jwt.verify(token, secret) as unknown as JwtPayload;

            // Gắn thông tin user vào request — Guard và Controller dùng sau
            (req as any).user = {
                id: decoded.sub,   // integer MySQL PK (không phải ObjectId MongoDB)
                role: decoded.role,
            } as Partial<RequestUser>;

            this.logger.debug(`Auth OK — userId: ${decoded.sub} role: ${decoded.role}`);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedException('Token đã hết hạn — vui lòng đăng nhập lại');
            }
            if (err instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedException('Token không hợp lệ');
            }
            // Lỗi không mong đợi
            this.logger.error('JWT verify error:', err);
            throw new UnauthorizedException('Xác thực thất bại');
        }

        next();
    }
}