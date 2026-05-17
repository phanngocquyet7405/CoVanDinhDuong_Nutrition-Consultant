

/**
 * middleware/index.ts — Barrel export toàn bộ middleware
 *
 * Thứ tự đăng ký trong AppModule.configure():
 *   consumer.apply(
 *     RequestIdMiddleware,    // 1. Sinh requestId trước
 *     LoggerMiddleware,       // 2. Log dùng requestId
 *     AuthMiddleware,         // 3. Decode JWT → req.user
 *   ).forRoutes('*');
 *
 * errorHandlerMiddleware đăng ký trong main.ts:
 *   app.use(errorHandlerMiddleware);  ← Express-level error handler
 *
 * ValidationMiddleware dùng per-route trong feature module:
 *   consumer.apply(ValidationMiddleware.forSchema(profileSchema))
 *           .forRoutes({ path: 'profile', method: RequestMethod.PUT });
 */

export { RequestIdMiddleware } from './RequestIdMiddleware ';
export { LoggerMiddleware } from './LoggerMiddleware';
export { AuthMiddleware } from './AuthMiddleware';
export { errorHandlerMiddleware } from './errorHandlerMiddleware';
export { ValidationMiddleware } from './ValidationMiddleware';

export * from './ValidationSchema';
