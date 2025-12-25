import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { StandardErrorExceptionFilter } from './common/exceptions/standard-error.exception-filter';
import { StandardResponseInterceptor } from './common/interceptors/standard-response.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { corsOptionsFactory } from './config/cors.config';

function getLogLevelsForEnvironment(nodeEnv: string | undefined): LogLevel[] {
  switch (nodeEnv) {
    case 'production':
      return ['error', 'warn', 'log'];
    case 'staging':
      return ['error', 'warn', 'log'];
    case 'development':
    default:
      return ['log', 'error', 'warn', 'debug', 'verbose'];
  }
}

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const logLevels = getLogLevelsForEnvironment(nodeEnv);

  // Ensure Nest Logger respects environment-specific levels even before app creation
  Logger.overrideLogger(logLevels);

  const logger = new Logger('ApplicationBootstrap');

  const app = await NestFactory.create(AppModule, { logger: logLevels });
  const configService = app.get(ConfigService);

  // CORS Configuration
  app.enableCors(corsOptionsFactory(configService));

  // Swagger UI
  const documentConfig = new DocumentBuilder()
    .setTitle('Claexa API')
    .setDescription('The Claexa API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, document);

  //Initializing class-validator pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  //Initializing Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new StandardResponseInterceptor());

  app.useGlobalFilters(new StandardErrorExceptionFilter());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
