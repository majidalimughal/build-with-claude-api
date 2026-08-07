import { AiProviderFactory } from './ai-provider.factory';
import { AnthropicProviderClient } from './providers/anthropic.provider';
import { AiProvider } from '@app/shared';

describe('AiProviderFactory', () => {
  const anthropicProvider = {} as AnthropicProviderClient;
  const factory = new AiProviderFactory(anthropicProvider);

  it('returns anthropic provider for anthropic keyword', () => {
    expect(factory.getProvider(AiProvider.ANTHROPIC)).toBe(anthropicProvider);
  });

  it('throws for openai provider', () => {
    expect(() => factory.getProvider(AiProvider.OPENAI)).toThrow(
      'OpenAI service not yet deployed',
    );
  });
});
