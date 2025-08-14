import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      'http://localhost:3000', // React development server
      'http://127.0.0.1:3000', // Alternative localhost
      'http://localhost:3001', // Backend itself (if needed)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true, // Allow cookies and authorization headers
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
