import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * @ApiPaginatedResponse() — Swagger decorator mô tả response phân trang
 *
 * Thay vì viết lại @ApiOkResponse mỗi lần, dùng decorator này:
 *
 *   @ApiPaginatedResponse(FoodDto)
 *   @Get()
 *   findAll(@Query() query: PaginationQuery) { ... }
 *
 * Swagger sẽ hiển thị schema:
 *   {
 *     success: true,
 *     data: {
 *       data: FoodDto[],
 *       meta: { total, page, limit, totalPages, hasNext, hasPrev }
 *     }
 *   }
 */
export function ApiPaginatedResponse<T>(model: Type<T>) {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'number', example: 200 },
                    timestamp: { type: 'string', example: '2024-06-01T07:00:00.000Z' },
                    data: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                            meta: {
                                type: 'object',
                                properties: {
                                    total: { type: 'number', example: 100 },
                                    page: { type: 'number', example: 1 },
                                    limit: { type: 'number', example: 20 },
                                    totalPages: { type: 'number', example: 5 },
                                    hasNext: { type: 'boolean', example: true },
                                    hasPrev: { type: 'boolean', example: false },
                                },
                            },
                        },
                    },
                },
            },
        }),
    );
}