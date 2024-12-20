import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  /* const corsOptions: CorsOptions = {
    origin: process.env.DEV ? true : [process.env.FRONT_URL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }; */

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  await app.listen(process.env.PORT, '0.0.0.0');
}
bootstrap();
