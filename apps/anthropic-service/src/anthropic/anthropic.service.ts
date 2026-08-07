import Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  ProviderInvokeDto,
  ProviderInvokeResponse,
  RmqPatterns,
} from '@app/shared';
import { CONVERSATION_EVENTS_CLIENT } from './anthropic.constants';

@Injectable()
export class AnthropicService {
  private readonly client: Anthropic;
  private readonly defaultModel: string;

  constructor(
    config: ConfigService,
    @Inject(CONVERSATION_EVENTS_CLIENT)
    private readonly eventsClient: ClientProxy,
  ) {
    this.client = new Anthropic({
      apiKey: config.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
    this.defaultModel = config.get<string>(
      'ANTHROPIC_DEFAULT_MODEL',
      'claude-haiku-4-5',
    );
  }

  async invoke(dto: ProviderInvokeDto): Promise<ProviderInvokeResponse> {
    try {
      const response = await this.client.messages.create({
        model: dto.model || this.defaultModel,
        max_tokens: dto.maxTokens ?? 1024,
        messages: dto.messages.map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.content,
        })),
        ...(dto.options ?? {}),
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const content = textBlock?.type === 'text' ? textBlock.text : '';

      return {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      throw new RpcException(this.extractErrorMessage(error));
    }
  }

  async stream(dto: ProviderInvokeDto): Promise<{ started: true }> {
    if (!dto.correlationId) {
      throw new Error('correlationId is required for streaming');
    }

    const correlationId = dto.correlationId;

    try {
      const stream = await this.client.messages.create({
        model: dto.model || this.defaultModel,
        max_tokens: dto.maxTokens ?? 1024,
        stream: true,
        messages: dto.messages.map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.content,
        })),
        ...(dto.options ?? {}),
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          this.eventsClient.emit(RmqPatterns.AI_STREAM_CHUNK, {
            correlationId,
            chunk: event.delta.text,
          });
        }
      }

      this.eventsClient.emit(RmqPatterns.AI_STREAM_END, { correlationId });
    } catch (error) {
      this.eventsClient.emit(RmqPatterns.AI_STREAM_ERROR, {
        correlationId,
        error: error instanceof Error ? error.message : 'Stream failed',
      });
      throw new RpcException(this.extractErrorMessage(error));
    }

    return { started: true };
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Anthropic API call failed';
  }
}
