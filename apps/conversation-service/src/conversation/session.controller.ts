import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateSessionDto,
  RmqPatterns,
} from '@app/shared';
import { SessionService } from './session.service';

@Controller()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @MessagePattern(RmqPatterns.SESSION_CREATE)
  create(@Payload() dto: CreateSessionDto) {
    return this.sessionService.create(dto);
  }

  @MessagePattern(RmqPatterns.SESSION_GET_MESSAGES)
  getMessages(@Payload() payload: { sessionId: string }) {
    return this.sessionService.getMessages(payload);
  }

  @MessagePattern(RmqPatterns.SESSION_SEND_MESSAGE)
  sendMessage(@Payload() payload: { sessionId: string; content: string }) {
    return this.sessionService.sendMessage(payload);
  }

  @MessagePattern(RmqPatterns.SESSION_SEND_MESSAGE_STREAM)
  sendMessageStream(
    @Payload() payload: { sessionId: string; content: string; correlationId?: string },
  ) {
    return this.sessionService.startMessageStream(payload);
  }
}
