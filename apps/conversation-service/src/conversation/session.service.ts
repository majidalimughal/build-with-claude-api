import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import {
  ConversationMessage,
  ConversationSession,
} from '@app/database';
import {
  ChatResponse,
  ConversationRequestDto,
  CreateSessionDto,
  MessageRole,
  MessageType,
  ProviderInvokeDto,
  SessionGetMessagesPayload,
  SessionMessageResponse,
  SessionResponse,
  SessionSendMessagePayload,
  SessionSendMessageStreamPayload,
} from '@app/shared';
import { AiProviderFactory } from '../ai/ai-provider.factory';
import { AuditService } from './audit.service';

interface StreamSessionState {
  sessionId: string;
  auditId: string;
  chunks: string[];
}

@Injectable()
export class SessionService {
  private readonly defaultModel: string;
  private readonly streamSessions = new Map<string, StreamSessionState>();

  constructor(
    @InjectRepository(ConversationSession)
    private readonly sessionRepository: Repository<ConversationSession>,
    @InjectRepository(ConversationMessage)
    private readonly messageRepository: Repository<ConversationMessage>,
    private readonly aiProviderFactory: AiProviderFactory,
    private readonly auditService: AuditService,
    config: ConfigService,
  ) {
    this.defaultModel = config.get<string>(
      'ANTHROPIC_DEFAULT_MODEL',
      'claude-haiku-4-5',
    );
  }

  async create(dto: CreateSessionDto): Promise<SessionResponse> {
    const session = this.sessionRepository.create({
      provider: dto.provider,
      model: dto.model ?? null,
      title: dto.title ?? null,
    });
    const saved = await this.sessionRepository.save(session);
    return this.toSessionResponse(saved);
  }

  async getMessages(
    payload: SessionGetMessagesPayload,
  ): Promise<SessionMessageResponse[]> {
    await this.requireSession(payload.sessionId);
    const messages = await this.messageRepository.find({
      where: { sessionId: payload.sessionId },
      order: { createdAt: 'ASC' },
    });
    return messages.map((message) => this.toMessageResponse(message));
  }

  async sendMessage(payload: SessionSendMessagePayload): Promise<ChatResponse> {
    const session = await this.requireSession(payload.sessionId);
    const userMessage = await this.saveMessage(
      session.id,
      MessageRole.USER,
      payload.content,
    );

    const history = await this.loadMessages(session.id);
    const auditDto = this.buildAuditDto(session, history);
    const audit = await this.auditService.createPending(auditDto);
    await this.auditService.markProcessing(audit.id);

    try {
      const provider = this.aiProviderFactory.getProvider(session.provider);
      const result = await provider.invoke(
        this.toProviderPayload(session, history, false),
      );

      const assistantMessage = await this.saveMessage(
        session.id,
        MessageRole.ASSISTANT,
        result.content,
      );
      await this.auditService.markCompleted(audit.id, result.content);

      return {
        sessionId: session.id,
        userMessage: this.toMessageResponse(userMessage),
        assistantMessage: this.toMessageResponse(assistantMessage),
        auditId: audit.id,
        usage: result.usage,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      await this.auditService.markFailed(audit.id, message);
      throw error;
    }
  }

  async startMessageStream(
    payload: SessionSendMessageStreamPayload,
  ): Promise<{ correlationId: string; auditId: string; sessionId: string }> {
    const session = await this.requireSession(payload.sessionId);
    await this.saveMessage(session.id, MessageRole.USER, payload.content);

    const history = await this.loadMessages(session.id);
    const correlationId = payload.correlationId ?? crypto.randomUUID();
    const auditDto = this.buildAuditDto(session, history, correlationId);
    const audit = await this.auditService.createPending(auditDto, correlationId);
    await this.auditService.markProcessing(audit.id);

    this.streamSessions.set(correlationId, {
      sessionId: session.id,
      auditId: audit.id,
      chunks: [],
    });

    try {
      const provider = this.aiProviderFactory.getProvider(session.provider);
      await provider.stream(
        this.toProviderPayload(session, history, true, correlationId),
      );

      return { correlationId, auditId: audit.id, sessionId: session.id };
    } catch (error) {
      this.streamSessions.delete(correlationId);
      const message = error instanceof Error ? error.message : 'Stream failed';
      await this.auditService.markFailed(audit.id, message);
      throw error;
    }
  }

  appendStreamChunk(correlationId: string, chunk: string): void {
    const state = this.streamSessions.get(correlationId);
    if (state) {
      state.chunks.push(chunk);
    }
  }

  async completeStream(correlationId: string): Promise<void> {
    const state = this.streamSessions.get(correlationId);
    if (!state) {
      return;
    }

    const content = state.chunks.join('');
    await this.saveMessage(state.sessionId, MessageRole.ASSISTANT, content);
    await this.auditService.markCompleted(state.auditId, content);
    this.streamSessions.delete(correlationId);
  }

  async failStream(correlationId: string, error: string): Promise<void> {
    const state = this.streamSessions.get(correlationId);
    if (!state) {
      return;
    }

    await this.auditService.markFailed(state.auditId, error);
    this.streamSessions.delete(correlationId);
  }

  private async requireSession(sessionId: string): Promise<ConversationSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new RpcException(`Session not found: ${sessionId}`);
    }
    return session;
  }

  private async loadMessages(sessionId: string): Promise<ConversationMessage[]> {
    return this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  private async saveMessage(
    sessionId: string,
    role: MessageRole,
    content: string,
  ): Promise<ConversationMessage> {
    const message = this.messageRepository.create({ sessionId, role, content });
    return this.messageRepository.save(message);
  }

  private buildAuditDto(
    session: ConversationSession,
    messages: ConversationMessage[],
    correlationId?: string,
  ): ConversationRequestDto {
    return {
      provider: session.provider,
      messageType: MessageType.CONVERSATION,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      model: session.model ?? undefined,
      correlationId,
    };
  }

  private toProviderPayload(
    session: ConversationSession,
    messages: ConversationMessage[],
    stream: boolean,
    correlationId?: string,
  ): ProviderInvokeDto {
    return {
      model: session.model ?? this.defaultModel,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      stream,
      correlationId,
    };
  }

  private toSessionResponse(session: ConversationSession): SessionResponse {
    return {
      id: session.id,
      provider: session.provider,
      model: session.model,
      title: session.title,
      createdAt: session.createdAt,
    };
  }

  private toMessageResponse(message: ConversationMessage): SessionMessageResponse {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}
