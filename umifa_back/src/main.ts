import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('UMIFA API')
    .setDescription('API de gestion du CEP Arabe - Union des Medersas Islamiques Franco-Arabes')
    .setVersion('1.0')
    .addTag('auth', 'Authentification')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('schools', 'Gestion des écoles/médersas')
    .addTag('school-years', 'Gestion des années scolaires')
    .addTag('exam-centers', "Gestion des centres d'examen")
    .addTag('candidates', 'Gestion des candidats')
    .addTag('grades', 'Gestion des notes')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application UMIFA Backend en cours d'exécution: http://localhost:${port}/api`);
  console.log(`Swagger documentation disponible sur : http://localhost:${port}/api/docs`);
}

bootstrap();
