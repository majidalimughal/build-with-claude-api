import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
      queue: config.get<string>(
        'RABBITMQ_QUEUE_GATEWAY_EVENTS',
        'gateway_events_queue',
      ),
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.get<number>('PORT', 3000));
}

bootstrap();
