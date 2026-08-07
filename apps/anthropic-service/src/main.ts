import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
        queue: process.env.RABBITMQ_QUEUE_ANTHROPIC ?? 'anthropic_queue',
        queueOptions: { durable: true },
      },
    },
  );

  await app.listen();
}

bootstrap();
