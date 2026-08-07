import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ConversationsController } from './conversations.controller';
import { SessionsController } from './sessions.controller';
import { ConversationsService } from './conversations.service';
import { StreamSessionService } from './stream-session.service';
import { CONVERSATION_CLIENT } from './conversations.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: CONVERSATION_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: config.get<string>(
              'RABBITMQ_QUEUE_CONVERSATION',
              'conversation_queue',
            ),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [ConversationsController, SessionsController],
  providers: [ConversationsService, StreamSessionService],
})
export class ConversationsModule {}
