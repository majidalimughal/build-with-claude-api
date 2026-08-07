import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  RmqPatterns,
  StreamChunkEvent,
  StreamEndEvent,
  StreamErrorEvent,
} from '@app/shared';
import { GATEWAY_EVENTS_CLIENT } from '../ai/ai.constants';

@Injectable()
export class StreamRelayService {
  constructor(
    @Inject(GATEWAY_EVENTS_CLIENT)
    private readonly gatewayEventsClient: ClientProxy,
  ) {}

  relayChunk(event: StreamChunkEvent): void {
    this.gatewayEventsClient.emit(RmqPatterns.CONVERSATION_STREAM_CHUNK, event);
  }

  relayEnd(event: StreamEndEvent): void {
    this.gatewayEventsClient.emit(RmqPatterns.CONVERSATION_STREAM_END, event);
  }

  relayError(event: StreamErrorEvent): void {
    this.gatewayEventsClient.emit(RmqPatterns.CONVERSATION_STREAM_ERROR, event);
  }
}
