import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles';
import { RequestUser } from '../../shared/types';

/**
 * RolesGuard — Phân quyền dựa trên role của user
 *
 * Chạy SAU JwtAuthGuard (req.user đã được gắn sẵn).
 * Đọc metadata @Roles() từ decorator và so sánh với user.role.
 *
 * Cách dùng (bắt buộc dùng sau JwtAuthGuard):
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *   @Delete(':id')
 *   deleteUser(@Param('id', ParseIntIdPipe) id: number) { ... }
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin', 'nutritionist')
 *   @Post()
 *   createFood(@Body() dto: CreateFoodDto) { ... }
 *
 * Nếu không có @Roles() → cho phép mọi user đã đăng nhập (chỉ cần JWT hợp lệ).
 * Nếu user.role không nằm trong danh sách → throw 403 ForbiddenException.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Lấy danh sách role được phép từ @Roles() decorator
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),  // Ưu tiên decorator trên method
            context.getClass(),    // Fallback sang decorator trên class
        ]);

        // Không có @Roles() → tất cả user đã đăng nhập đều qua
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user as RequestUser | undefined;

        // Không có user → JwtAuthGuard chưa chạy đúng
        if (!user) {
            throw new ForbiddenException('Không xác định được người dùng');
        }

        // Kiểm tra role
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Tài khoản role "${user.role}" không có quyền truy cập. ` +
                `Yêu cầu: ${requiredRoles.join(' | ')}`,
            );
        }

        return true;
    }
}