import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiRequest } from './entities/ai-request.entity';
import { ConversationMessage } from './entities/conversation-message.entity';
import { ConversationSession } from './entities/conversation-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get<string>('POSTGRES_USER', 'app'),
        password: config.get<string>('POSTGRES_PASSWORD', 'app'),
        database: config.get<string>('POSTGRES_DB', 'ai_platform'),
        entities: [AiRequest, ConversationSession, ConversationMessage],
        synchronize: config.get<string>('TYPEORM_SYNC', 'false') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([
      AiRequest,
      ConversationSession,
      ConversationMessage,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
