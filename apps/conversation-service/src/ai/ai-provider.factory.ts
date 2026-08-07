import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AiProvider } from '@app/shared';
import { AiProviderClient } from './interfaces/ai-provider-client.interface';
import { AnthropicProviderClient } from './providers/anthropic.provider';

@Injectable()
export class AiProviderFactory {
  constructor(private readonly anthropicProvider: AnthropicProviderClient) {}

  getProvider(provider: AiProvider): AiProviderClient {
    switch (provider) {
      case AiProvider.ANTHROPIC:
        return this.anthropicProvider;
      case AiProvider.OPENAI:
        throw new RpcException('OpenAI service not yet deployed');
      default:
        throw new RpcException(`Unknown provider: ${provider as string}`);
    }
  }
}
