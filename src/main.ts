import { NestFactory } from '@nestjs/core';
<<<<<<< HEAD
=======
import { ValidationPipe, BadRequestException } from '@nestjs/common';
>>>>>>> ec694c1 (feat:update modules in backend NT)
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => console.error(error));
=======

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(e =>
          Object.values(e.constraints ?? {}).join(', ')
        );
        return new BadRequestException({
          statusCode: 400,
          message: messages,
          error: 'Validation Error',
        });
      },
    }),
  );

  await app.listen(3000);
  console.log(`Server running on http://localhost:3000`);
}

bootstrap();
>>>>>>> ec694c1 (feat:update modules in backend NT)
