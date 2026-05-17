/**
 * shared/utils/pagination.utils.ts
 *
 * Tiện ích phân trang dùng với TypeORM findAndCount().
 *
 * Cách dùng trong Service:
 *
 *   async findAll(query: PaginationQuery) {
 *     const { skip, take, page, limit } = buildPagination(query);
 *     const [data, total] = await this.repo.findAndCount({
 *       skip,
 *       take,
 *       order: { createdAt: 'DESC' },
 *     });
 *     return buildPaginatedResult(data, total, page, limit);
 *   }
 */

import { PaginatedResult, PaginationMeta, PaginationQuery } from '../types';
import { API_LIMITS } from '../constants/nutrition.constrants';

/**
 * Chuyển PaginationQuery → tham số TypeORM (skip + take)
 *
 * @example buildPagination({ page: 2, limit: 10 })
 *          → { skip: 10, take: 10, page: 2, limit: 10 }
 *
 * @example buildPagination({})
 *          → { skip: 0, take: 20, page: 1, limit: 20 }
 */
export function buildPagination(query: PaginationQuery): {
    skip: number;
    take: number;
    page: number;
    limit: number;
} {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(
        API_LIMITS.maxPageSize,
        Math.max(1, query.limit ?? API_LIMITS.defaultPageSize),
    );
    return { skip: (page - 1) * limit, take: limit, page, limit };
}

/**
 * Xây dựng PaginatedResult đầy đủ từ dữ liệu findAndCount
 *
 * @param data   Mảng dữ liệu trang hiện tại
 * @param total  Tổng số record (từ COUNT của TypeORM)
 * @param page   Trang hiện tại
 * @param limit  Số item mỗi trang
 *
 * @example buildPaginatedResult(foods, 100, 2, 20)
 *   → {
 *       data: [...20 items],
 *       meta: { total:100, page:2, limit:20, totalPages:5, hasNext:true, hasPrev:true }
 *     }
 */
export function buildPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
): PaginatedResult<T> {
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    const meta: PaginationMeta = {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
    return { data, meta };
}