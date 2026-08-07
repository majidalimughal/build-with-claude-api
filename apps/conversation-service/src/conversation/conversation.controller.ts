import { Controller } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {
  ConversationRequestDto,
  RmqPatterns,
} from '@app/shared';
import { ConversationService } from './conversation.service';
import { SessionService } from './session.service';
import { StreamRelayService } from './stream-relay.service';

@Controller()
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly sessionService: SessionService,
    private readonly streamRelayService: StreamRelayService,
  ) {}

  @MessagePattern(RmqPatterns.CONVERSATION_HANDLE)
  handle(@Payload() dto: ConversationRequestDto) {
    return this.conversationService.handle(dto);
  }

  @MessagePattern(RmqPatterns.CONVERSATION_STREAM)
  startStream(@Payload() dto: ConversationRequestDto) {
    return this.conversationService.startStream(dto);
  }

  @EventPattern(RmqPatterns.AI_STREAM_CHUNK)
  onStreamChunk(@Payload() event: { correlationId: string; chunk: string }) {
    this.sessionService.appendStreamChunk(event.correlationId, event.chunk);
    this.streamRelayService.relayChunk(event);
  }

  @EventPattern(RmqPatterns.AI_STREAM_END)
  async onStreamEnd(@Payload() event: { correlationId: string }) {
    await this.sessionService.completeStream(event.correlationId);
    await this.conversationService.onStreamEnd(event.correlationId);
    this.streamRelayService.relayEnd(event);
  }

  @EventPattern(RmqPatterns.AI_STREAM_ERROR)
  async onStreamError(@Payload() event: { correlationId: string; error: string }) {
    await this.sessionService.failStream(event.correlationId, event.error);
    await this.conversationService.onStreamError(event.correlationId, event.error);
    this.streamRelayService.relayError(event);
  }
}
