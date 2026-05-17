/**
 * shared/index.ts — Barrel export toàn bộ shared layer
 *
 * Import gọn trong module:
 *   import { UserRole, Goal, calcBMI, buildPagination } from '@shared';
 *   import { EntityNotFoundException, DuplicateException } from '@shared';
 *
 * (cần cấu hình paths trong tsconfig.json: "@shared/*": ["src/shared/*"])
 */

// Types
export * from './types';

// Constants & Enums
export * from './constants/nutrition.constrants';

// Utils
export * from './utils/nutrition';
export { buildPagination, buildPaginatedResult } from './utils/pagination';
export * from './utils/date';

// Exceptions
export * from './exception/business.exception';