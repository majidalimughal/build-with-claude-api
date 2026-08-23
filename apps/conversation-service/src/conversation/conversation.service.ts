import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import {
  AiProvider,
  ConversationRequestDto,
  ConversationResponse,
  MessageType,
  ProviderInvokeDto,
  resolveSystemPrompt,
} from '@app/shared';
import { hashPayload } from '@app/shared';
import { AiProviderFactory } from '../ai/ai-provider.factory';
import { AuditService } from './audit.service';

@Injectable()
export class ConversationService {
  private readonly defaultModel: string;
  private readonly defaultProvider: AiProvider;
  private readonly streamAudits = new Map<string, string>();

  constructor(
    private readonly aiProviderFactory: AiProviderFactory,
    private readonly auditService: AuditService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    config: ConfigService,
  ) {
    this.defaultModel = config.get<string>(
      'ANTHROPIC_DEFAULT_MODEL',
      'claude-haiku-4-5',
    );
    this.defaultProvider = config.get<AiProvider>(
      'DEFAULT_PROVIDER',
      AiProvider.ANTHROPIC,
    );
  }

  async handle(dto: ConversationRequestDto): Promise<ConversationResponse> {
    const resolved = this.withDefaultProvider(dto);
    const cacheKey = `conversation:${hashPayload(resolved)}`;
    const cached = await this.cacheManager.get<ConversationResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const audit = await this.auditService.createPending(resolved);
    await this.auditService.markProcessing(audit.id);

    try {
      const provider = this.aiProviderFactory.getProvider(resolved.provider);
      const payload = this.toProviderPayload(resolved, false);
      const result = await provider.invoke(payload);

      await this.auditService.markCompleted(audit.id, result.content);

      const response: ConversationResponse = {
        content: result.content,
        auditId: audit.id,
        usage: result.usage,
      };

      if (resolved.messageType === MessageType.ONE_SHOT) {
        await this.cacheManager.set(cacheKey, response);
      }

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      await this.auditService.markFailed(audit.id, message);
      throw error;
    }
  }

  async startStream(dto: ConversationRequestDto): Promise<{ correlationId: string; auditId: string }> {
    const resolved = this.withDefaultProvider(dto);
    const correlationId = resolved.correlationId ?? crypto.randomUUID();
    const audit = await this.auditService.createPending(
      { ...resolved, correlationId },
      correlationId,
    );
    await this.auditService.markProcessing(audit.id);

    try {
      const provider = this.aiProviderFactory.getProvider(resolved.provider);
      const payload = this.toProviderPayload(
        { ...resolved, correlationId },
        true,
      );
      await provider.stream(payload);
      this.streamAudits.set(correlationId, audit.id);

      return { correlationId, auditId: audit.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stream failed';
      await this.auditService.markFailed(audit.id, message);
      throw error;
    }
  }

  private withDefaultProvider(
    dto: ConversationRequestDto,
  ): ConversationRequestDto & { provider: AiProvider } {
    return {
      ...dto,
      provider: dto.provider ?? this.defaultProvider,
    };
  }

  async onStreamEnd(correlationId: string): Promise<void> {
    const auditId = this.streamAudits.get(correlationId);
    if (auditId) {
      await this.auditService.markCompleted(auditId, '[stream completed]');
      this.streamAudits.delete(correlationId);
    }
  }

  async onStreamError(correlationId: string, error: string): Promise<void> {
    const auditId = this.streamAudits.get(correlationId);
    if (auditId) {
      await this.auditService.markFailed(auditId, error);
      this.streamAudits.delete(correlationId);
    }
  }

  private toProviderPayload(
    dto: ConversationRequestDto,
    stream: boolean,
  ): ProviderInvokeDto {
    return {
      model: dto.model ?? this.defaultModel,
      messages: dto.messages,
      stream,
      correlationId: dto.correlationId,
      options: dto.options,
      system: resolveSystemPrompt(dto.systemPromptType),
    };
  }
}
