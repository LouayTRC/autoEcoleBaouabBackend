import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorHandler } from './middlewares/errorHandler';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  
  const httpsOptions = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
  };
  
  // Dev
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  
  // Prod
  // const app = await NestFactory.create(AppModule, {httpsOptions});
  
  app.enableCors({
    origin: 'http://localhost:4200', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // si tu utilises cookies ou headers d'auth
  });

  
  app.setGlobalPrefix('api')
  app.useGlobalFilters(new ErrorHandler());

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


