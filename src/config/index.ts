/**
 * Barrel export toàn bộ config
 *
 * Import gọn trong app.module.ts:
 *   import { appConfig, databaseConfig, jwtConfig } from './config';
 *
 * Thứ tự load trong ConfigModule.forRoot({ load: [...] }):
 *   1. appConfig       → namespace 'app'
 *   2. databaseConfig  → namespace 'database'
 *   3. jwtConfig       → namespace 'jwt'
 *
 * Cách truy cập giá trị:
 *   configService.get<number>('app.port')          → 3000
 *   configService.get<string>('database.host')     → '127.0.0.1'
 *   configService.get<string>('jwt.secret')        → '...'
 */
export { appConfig } from './app.config';
export { databaseConfig } from './database.config';
export { jwtConfig } from './jwt.config';
export { validationSchema } from './validation.schema';