import 'dotenv/config';
import dns from 'node:dns';

// Force IPv4 first to avoid ETIMEDOUT on IPv6-only DNS resolutions (e.g. SMTP)
dns.setDefaultResultOrder('ipv4first');

import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters(
      {
        in: 'header',
        required: false,
        name: 'X-Tenant-ID',
        description: 'Tenant UUID (overrides JWT tenantId claim)',
        schema: {
          type: 'string',
          format: 'uuid',
          example: '00000000-0000-0000-0000-000000000001',
        },
      },
      {
        in: 'header',
        required: false,
        name: 'X-Branch-ID',
        description: 'Branch UUID (optional, scopes data to a specific branch)',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
      {
        in: 'header',
        required: false,
        name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
        schema: {
          example: 'en',
        },
      },
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/reference', (_req: any, res: any) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>API Reference</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <div id="app"></div>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
          <script>
            Scalar.createApiReference(document.getElementById('app'), {
              url: '/docs-json',
              theme: 'alternate',
              authentication: {
                preferredSecurityScheme: 'bearer',
                http: {
                  bearer: {
                    token: '',
                  },
                },
              },
            })
          </script>
        </body>
      </html>
    `);
  });

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
