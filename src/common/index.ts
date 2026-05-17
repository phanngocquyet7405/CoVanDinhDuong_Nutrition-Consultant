/**
 * common/index.ts — Barrel export toàn bộ common layer
 *
 * Import gọn trong module:
 *   import { JwtAuthGuard, RolesGuard, GetUser, Roles } from '../common';
 *   import { ParseIntIdPipe, HttpExceptionFilter }        from '../common';
 *   import { ResponseInterceptor }                        from '../common';
 */

import { ParseIntIdPipe } from './pipes/parse-int-id';

// ── Decorators ────────────────────────────────────────────────────
export {
    Roles,
    GetUser,
    Public,
    ROLES_KEY,
    IS_PUBLIC_KEY,
} from './decorators/roles';

export { ApiPaginatedResponse } from './decorators/api-paginated-response';

// ── Filters ───────────────────────────────────────────────────────
export { HttpExceptionFilter } from './filters/http-exception';

// ── Guards ────────────────────────────────────────────────────────
export { JwtAuthGuard } from './guards/jwt-auth';
export { RolesGuard } from './guards/roles';
export { AppThrottlerGuard } from './guards/throttle';

// ── Interceptors ──────────────────────────────────────────────────
export { ResponseInterceptor } from './interceptors/response';
export { LoggingInterceptor } from './interceptors/logging';

// ── Pipes ─────────────────────────────────────────────────────────
export { ParseIntIdPipe } from './pipes/parse-int-id';
export { AppValidationPipe } from './pipes/validation';