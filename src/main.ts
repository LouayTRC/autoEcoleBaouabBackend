import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorHandler } from './middlewares/errorHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalFilters(new ErrorHandler())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


