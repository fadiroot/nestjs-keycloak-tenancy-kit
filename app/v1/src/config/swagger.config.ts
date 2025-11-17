import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { swaggerDarkTheme } from '../public/swagger-dark-theme';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
  const config = new DocumentBuilder()
    .setTitle('companyRh API Documentation')
    .setDescription(`
      ## Authentication
      This API uses JWT Bearer token authentication.
      
      ### How to authenticate:
      1. Get your JWT token from the auth endpoint
      2. Click the 'Authorize' button at the top
      3. Enter your token without the "Bearer " prefix
      4. Click "Authorize"
      
      ### Headers Required:
      - Authorization: Bearer <your_token>
      - organization-kc-id: <your_org_id>
    `)
    .setVersion(configService.get('SWAGGER_VERSION'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'organization-kc-id',
        in: 'header',
        description: 'Enter your organization ID',
      },
      'organization-kc-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api-docs', app, document, {
    customCss: swaggerDarkTheme,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      requestSnippetsEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      },
      
    },
  });
}