import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AnthropicController } from './anthropic.controller';
import { AnthropicService } from './anthropic.service';
import { CONVERSATION_EVENTS_CLIENT } from './anthropic.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CONVERSATION_EVENTS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: config.get<string>(
              'RABBITMQ_QUEUE_CONVERSATION_EVENTS',
              'conversation_events_queue',
            ),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [AnthropicController],
  providers: [AnthropicService],
})
export class AnthropicModule {}
