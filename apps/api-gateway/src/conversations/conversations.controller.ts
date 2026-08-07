import {
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ConversationRequestDto,
  RmqPatterns,
} from '@app/shared';
import { ConversationsService } from './conversations.service';
import { StreamSessionService } from './stream-session.service';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly streamSessionService: StreamSessionService,
  ) {}

  @Post()
  handle(@Body() dto: ConversationRequestDto) {
    return this.conversationsService.handle(dto);
  }

  @Post('stream')
  async stream(
    @Body() dto: ConversationRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const correlationId = dto.correlationId ?? crypto.randomUUID();
    const subject = this.streamSessionService.register(correlationId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const subscription = subject.subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
      },
      complete: () => {
        res.end();
      },
      error: (error: Error) => {
        res.write(
          `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`,
        );
        res.end();
      },
    });

    res.on('close', () => {
      subscription.unsubscribe();
      this.streamSessionService.close(correlationId);
    });

    try {
      await this.conversationsService.startStream({ ...dto, correlationId });
    } catch (error) {
      subscription.unsubscribe();
      this.streamSessionService.close(correlationId);
      const message = error instanceof Error ? error.message : 'Stream failed';
      res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      res.end();
    }
  }

  @EventPattern(RmqPatterns.CONVERSATION_STREAM_CHUNK)
  onStreamChunk(@Payload() event: { correlationId: string; chunk: string }) {
    const subject = this.streamSessionService.get(event.correlationId);
    subject?.next({ data: { type: 'chunk', chunk: event.chunk } });
  }

  @EventPattern(RmqPatterns.CONVERSATION_STREAM_END)
  onStreamEnd(@Payload() event: { correlationId: string }) {
    const subject = this.streamSessionService.get(event.correlationId);
    subject?.next({ data: { type: 'end' } });
    this.streamSessionService.close(event.correlationId);
  }

  @EventPattern(RmqPatterns.CONVERSATION_STREAM_ERROR)
  onStreamError(@Payload() event: { correlationId: string; error: string }) {
    const subject = this.streamSessionService.get(event.correlationId);
    subject?.error(new Error(event.error));
    this.streamSessionService.close(event.correlationId);
  }
}
