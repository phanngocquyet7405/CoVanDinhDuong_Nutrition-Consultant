import {
    createParamDecorator,
    ExecutionContext,
    SetMetadata,
} from '@nestjs/common';
import { RequestUser } from '../../shared/types';

/**
 * ROLES_KEY — metadata key dùng bởi RolesGuard để đọc danh sách role
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles() — gán danh sách role được phép truy cập endpoint
 *
 * Cách dùng:
 *   @Roles('admin')                         → chỉ admin
 *   @Roles('admin', 'nutritionist')         → admin hoặc nutritionist
 *   @Roles(UserRole.ADMIN, UserRole.USER)   → dùng enum từ shared/constants
 *
 * Kết hợp bắt buộc với @UseGuards(JwtAuthGuard, RolesGuard):
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *   @Delete(':id')
 *   deleteUser(@Param('id') id: number) { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * @GetUser() — lấy thông tin user đã đăng nhập từ request
 *
 * Được gắn vào req.user bởi JwtStrategy sau khi verify JWT.
 * Trả về RequestUser { id: number, email, role, name }
 *
 * Cách dùng:
 *   @Get('me')
 *   @UseGuards(JwtAuthGuard)
 *   getMe(@GetUser() user: RequestUser) {
 *     return this.usersService.findById(user.id);
 *   }
 *
 *   // Lấy chỉ một field:
 *   getMe(@GetUser('id') userId: number) { ... }
 */
export const GetUser = createParamDecorator(
    (field: keyof RequestUser | undefined, ctx: ExecutionContext) => {
        const user = ctx.switchToHttp().getRequest().user as RequestUser;
        return field ? user?.[field] : user;
    },
);

/**
 * @Public() — đánh dấu route là public, bỏ qua JwtAuthGuard
 *
 * Dùng kết hợp với JwtAuthGuard mở rộng kiểm tra metadata IS_PUBLIC_KEY.
 *
 * Cách dùng:
 *   @Public()
 *   @Post('login')
 *   login(@Body() dto: LoginDto) { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);