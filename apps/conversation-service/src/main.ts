import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const rmqUrl = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: process.env.RABBITMQ_QUEUE_CONVERSATION ?? 'conversation_queue',
      queueOptions: { durable: true },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue:
        process.env.RABBITMQ_QUEUE_CONVERSATION_EVENTS ??
        'conversation_events_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
}

bootstrap();
