import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiRequest } from '@app/database';
import { AiRequestStatus, AiProvider, ConversationRequestDto } from '@app/shared';
import { hashPayload, truncateSummary } from '@app/shared';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AiRequest)
    private readonly aiRequestRepository: Repository<AiRequest>,
  ) {}

  async createPending(
    dto: ConversationRequestDto & { provider: AiProvider },
    correlationId?: string,
  ): Promise<AiRequest> {
    const record = this.aiRequestRepository.create({
      provider: dto.provider,
      messageType: dto.messageType,
      payloadHash: hashPayload(dto),
      status: AiRequestStatus.PENDING,
      correlationId: correlationId ?? null,
    });
    return this.aiRequestRepository.save(record);
  }

  async markProcessing(id: string): Promise<void> {
    await this.aiRequestRepository.update(id, {
      status: AiRequestStatus.PROCESSING,
    });
  }

  async markCompleted(id: string, content: string): Promise<void> {
    await this.aiRequestRepository.update(id, {
      status: AiRequestStatus.COMPLETED,
      responseSummary: truncateSummary(content),
      completedAt: new Date(),
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.aiRequestRepository.update(id, {
      status: AiRequestStatus.FAILED,
      error,
      completedAt: new Date(),
    });
  }
}
