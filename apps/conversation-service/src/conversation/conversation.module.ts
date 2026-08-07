import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { DatabaseModule } from '@app/database';
import { AiModule } from '../ai/ai.module';
import { AuditService } from './audit.service';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { StreamRelayService } from './stream-relay.service';

@Module({
  imports: [
    DatabaseModule,
    AiModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
          },
          ttl: config.get<number>('REDIS_TTL', 300) * 1000,
        }),
      }),
    }),
  ],
  controllers: [ConversationController, SessionController],
  providers: [ConversationService, SessionService, AuditService, StreamRelayService],
})
export class ConversationModule {}
