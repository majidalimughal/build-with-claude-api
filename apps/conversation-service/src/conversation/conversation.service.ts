import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import {
  ConversationRequestDto,
  ConversationResponse,
  MessageType,
  ProviderInvokeDto,
} from '@app/shared';
import { hashPayload } from '@app/shared';
import { AiProviderFactory } from '../ai/ai-provider.factory';
import { AuditService } from './audit.service';

@Injectable()
export class ConversationService {
  private readonly defaultModel: string;
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
  }

  async handle(dto: ConversationRequestDto): Promise<ConversationResponse> {
    const cacheKey = `conversation:${hashPayload(dto)}`;
    const cached = await this.cacheManager.get<ConversationResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const audit = await this.auditService.createPending(dto);
    await this.auditService.markProcessing(audit.id);

    try {
      const provider = this.aiProviderFactory.getProvider(dto.provider);
      const payload = this.toProviderPayload(dto, false);
      const result = await provider.invoke(payload);

      await this.auditService.markCompleted(audit.id, result.content);

      const response: ConversationResponse = {
        content: result.content,
        auditId: audit.id,
        usage: result.usage,
      };

      if (dto.messageType === MessageType.ONE_SHOT) {
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
    const correlationId = dto.correlationId ?? crypto.randomUUID();
    const audit = await this.auditService.createPending(
      { ...dto, correlationId },
      correlationId,
    );
    await this.auditService.markProcessing(audit.id);

    try {
      const provider = this.aiProviderFactory.getProvider(dto.provider);
      const payload = this.toProviderPayload(
        { ...dto, correlationId },
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
    };
  }
}
