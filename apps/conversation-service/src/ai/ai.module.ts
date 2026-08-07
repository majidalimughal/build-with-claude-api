import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AiProviderFactory } from './ai-provider.factory';
import { AnthropicProviderClient } from './providers/anthropic.provider';
import { ANTHROPIC_CLIENT, GATEWAY_EVENTS_CLIENT } from './ai.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ANTHROPIC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: config.get<string>('RABBITMQ_QUEUE_ANTHROPIC', 'anthropic_queue'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: GATEWAY_EVENTS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: config.get<string>(
              'RABBITMQ_QUEUE_GATEWAY_EVENTS',
              'gateway_events_queue',
            ),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [AiProviderFactory, AnthropicProviderClient],
  exports: [AiProviderFactory, ClientsModule],
})
export class AiModule {}
