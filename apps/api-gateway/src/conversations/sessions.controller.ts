import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateSessionDto, SendSessionMessageDto } from '@app/shared';
import { ConversationsService } from './conversations.service';
import { StreamSessionService } from './stream-session.service';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly streamSessionService: StreamSessionService,
  ) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.conversationsService.createSession(dto);
  }

  @Get(':id/messages')
  getMessages(@Param('id') sessionId: string) {
    return this.conversationsService.getSessionMessages(sessionId);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') sessionId: string,
    @Body() dto: SendSessionMessageDto,
  ) {
    return this.conversationsService.sendSessionMessage(sessionId, dto.content);
  }

  @Post(':id/messages/stream')
  async streamMessage(
    @Param('id') sessionId: string,
    @Body() dto: SendSessionMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    const correlationId = crypto.randomUUID();
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
      await this.conversationsService.startSessionMessageStream(
        sessionId,
        dto.content,
        correlationId,
      );
    } catch (error) {
      subscription.unsubscribe();
      this.streamSessionService.close(correlationId);
      const message = error instanceof Error ? error.message : 'Stream failed';
      res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      res.end();
    }
  }
}
