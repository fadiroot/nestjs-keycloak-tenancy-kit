import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';
import { I18nService } from 'nestjs-i18n';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { I18nValidationPipe } from './common/pipes/i18n-validation.pipe';
import { Reflector } from '@nestjs/core';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        'https://companyhr-monorepo.vercel.app',
        'https://employee-companyhr-monorepo.vercel.app',
        'http://localhost:4200',
        'http://localhost:4201',
        'http://127.0.0.1:4200',
        'http://127.0.0.1:4201',
        'https://dev-admin-hr.company.com',
        'https://dev-employee-hr.company.com',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    },
  });

  const configService = app.get(ConfigService);
  // Replace BigInt values in response
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      return originalJson.call(
        this,
        JSON.parse(
          JSON.stringify(data, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        )
      );
    };
    next();
  });

  // Get i18n service for translating error messages
  const i18n: I18nService = app.get(I18nService);
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api/v1');

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(i18n));

  // Apply global validation pipe with i18n support
  app.useGlobalPipes(new I18nValidationPipe(i18n, reflector));

  // Setup Swagger for API docs
  setupSwagger(app, configService);

  // Start the application on the port defined in the environment
  await app.listen(configService.get('APP_PORT'));
}

bootstrap();
