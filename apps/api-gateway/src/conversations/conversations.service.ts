import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ChatResponse,
  ConversationRequestDto,
  ConversationResponse,
  CreateSessionDto,
  RmqPatterns,
  SessionMessageResponse,
  SessionResponse,
} from '@app/shared';
import { CONVERSATION_CLIENT } from './conversations.constants';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_CLIENT) private readonly conversationClient: ClientProxy,
  ) {}

  handle(dto: ConversationRequestDto): Promise<ConversationResponse> {
    return firstValueFrom(
      this.conversationClient.send(RmqPatterns.CONVERSATION_HANDLE, dto),
    );
  }

  startStream(
    dto: ConversationRequestDto,
  ): Promise<{ correlationId: string; auditId: string }> {
    const correlationId = dto.correlationId ?? crypto.randomUUID();
    return firstValueFrom(
      this.conversationClient.send(RmqPatterns.CONVERSATION_STREAM, {
        ...dto,
        correlationId,
      }),
    );
  }

  createSession(dto: CreateSessionDto): Promise<SessionResponse> {
    return firstValueFrom(
      this.conversationClient.send(RmqPatterns.SESSION_CREATE, dto),
    );
  }

  getSessionMessages(sessionId: string): Promise<SessionMessageResponse[]> {
    return firstValueFrom(
      this.conversationClient.send(RmqPatterns.SESSION_GET_MESSAGES, {
        sessionId,
      }),
    );
  }

  sendSessionMessage(
    sessionId: string,
    content: string,
  ): Promise<ChatResponse> {
    return firstValueFrom(
      this.conversationClient.send(RmqPatterns.SESSION_SEND_MESSAGE, {
        sessionId,
        content,
      }),
    );
  }

  startSessionMessageStream(
    sessionId: string,
    content: string,
    correlationId: string,
  ): Promise<{ correlationId: string; auditId: string; sessionId: string }> {
    return firstValueFrom(
      this.conversationClient.send(RmqPatterns.SESSION_SEND_MESSAGE_STREAM, {
        sessionId,
        content,
        correlationId,
      }),
    );
  }
}
