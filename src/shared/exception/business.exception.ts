/**
 * shared/exceptions/business.exception.ts
 *
 * Custom exception classes mở rộng HttpException của NestJS.
 * Dùng thay vì new HttpException('...', 400) để code rõ nghĩa hơn.
 *
 * HttpExceptionFilter trong common/filters/ bắt và format tất cả exception này.
 *
 * Cách dùng trong Service:
 *
 *   throw new EntityNotFoundException('User', userId);
 *   throw new DuplicateException('Email');
 *   throw new BusinessException('Số lượng vượt giới hạn', HttpStatus.BAD_REQUEST);
 *   throw new ForbiddenException('Không có quyền truy cập tài nguyên này');
 */

import { HttpException, HttpStatus } from '@nestjs/common';

// ── Helpers ───────────────────────────────────────────────────────────────

/** Tạo body response chuẩn cho exception */
function makeBody(message: string, statusCode: HttpStatus): object {
    return { success: false, message, statusCode };
}

// ── Exception Classes ─────────────────────────────────────────────────────

/**
 * Lỗi nghiệp vụ chung — dùng khi không có class cụ thể nào phù hợp
 * Mặc định: 400 Bad Request
 *
 * @example throw new BusinessException('Kế hoạch ăn đã hết hạn')
 * @example throw new BusinessException('Vượt quá giới hạn 10 kế hoạch', HttpStatus.UNPROCESSABLE_ENTITY)
 */
export class BusinessException extends HttpException {
    constructor(
        message: string,
        status: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        super(makeBody(message, status), status);
    }
}

/**
 * Entity không tồn tại — 404 Not Found
 *
 * @example throw new EntityNotFoundException('User', userId)      → "User #5 không tồn tại"
 * @example throw new EntityNotFoundException('MealPlan')          → "MealPlan không tồn tại"
 */
export class EntityNotFoundException extends HttpException {
    constructor(entity: string, id?: number | string) {
        const message = id != null
            ? `${entity} #${id} không tồn tại`
            : `${entity} không tồn tại`;
        super(makeBody(message, HttpStatus.NOT_FOUND), HttpStatus.NOT_FOUND);
    }
}

/**
 * Dữ liệu đã tồn tại — 409 Conflict
 *
 * @example throw new DuplicateException('Email')    → "Email đã tồn tại trong hệ thống"
 * @example throw new DuplicateException('username') → "username đã tồn tại trong hệ thống"
 */
export class DuplicateException extends HttpException {
    constructor(field: string) {
        const message = `${field} đã tồn tại trong hệ thống`;
        super(makeBody(message, HttpStatus.CONFLICT), HttpStatus.CONFLICT);
    }
}

/**
 * Không có quyền truy cập — 403 Forbidden
 * Khác với 401 Unauthorized (chưa đăng nhập) — đây là đã đăng nhập nhưng không đủ quyền
 *
 * @example throw new ForbiddenResourceException()
 * @example throw new ForbiddenResourceException('Chỉ admin mới có thể xoá user')
 */
export class ForbiddenResourceException extends HttpException {
    constructor(message = 'Bạn không có quyền thực hiện thao tác này') {
        super(makeBody(message, HttpStatus.FORBIDDEN), HttpStatus.FORBIDDEN);
    }
}

/**
 * Dữ liệu không hợp lệ — 422 Unprocessable Entity
 * Dùng khi dữ liệu đúng format nhưng sai về logic nghiệp vụ
 *
 * @example throw new InvalidDataException('Ngày kết thúc phải sau ngày bắt đầu')
 * @example throw new InvalidDataException('BMI không hợp lệ — hãy cập nhật hồ sơ sức khoẻ')
 */
export class InvalidDataException extends HttpException {
    constructor(message: string) {
        super(
            makeBody(message, HttpStatus.UNPROCESSABLE_ENTITY),
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

/**
 * Chưa có dữ liệu bắt buộc — 400 Bad Request với hướng dẫn
 * Dùng khi user chưa tạo profile trước khi dùng tính năng cần profile
 *
 * @example throw new PrerequisiteException('hồ sơ sức khoẻ', '/api/v1/profile')
 */
export class PrerequisiteException extends HttpException {
    constructor(resource: string, createUrl?: string) {
        const hint = createUrl ? ` Tạo tại: ${createUrl}` : '';
        const message = `Bạn cần tạo ${resource} trước khi sử dụng tính năng này.${hint}`;
        super(makeBody(message, HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
    }
}