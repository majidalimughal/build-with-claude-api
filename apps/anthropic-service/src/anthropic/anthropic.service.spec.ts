import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { AnthropicService } from './anthropic.service';
import { CONVERSATION_EVENTS_CLIENT } from './anthropic.constants';

const messagesCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: messagesCreate,
    },
  }));
});

describe('AnthropicService', () => {
  let service: AnthropicService;
  const eventsClient: Pick<ClientProxy, 'emit'> = {
    emit: jest.fn(),
  };

  const configValues: Record<string, string> = {
    ANTHROPIC_API_KEY: 'test-key',
    ANTHROPIC_DEFAULT_MODEL: 'claude-haiku-4-5',
    ANTHROPIC_PROMPT_CACHING: 'true',
  };

  beforeEach(async () => {
    messagesCreate.mockReset();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnthropicService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) =>
              configValues[key] ?? defaultValue,
            ),
            getOrThrow: jest.fn((key: string) => configValues[key]),
          },
        },
        {
          provide: CONVERSATION_EVENTS_CLIENT,
          useValue: eventsClient,
        },
      ],
    }).compile();

    service = module.get(AnthropicService);
  });

  it('passes system prompt and ephemeral cache_control to messages.create', async () => {
    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Plan your trip to Lahore.' }],
      usage: {
        input_tokens: 100,
        output_tokens: 20,
        cache_creation_input_tokens: 80,
        cache_read_input_tokens: 0,
      },
    });

    const result = await service.invoke({
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: 'Suggest a Lahore weekend trip' }],
      stream: false,
      system: 'You are a Pakistan travel agent.',
    });

    expect(messagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        cache_control: { type: 'ephemeral' },
        system: [
          {
            type: 'text',
            text: 'You are a Pakistan travel agent.',
            cache_control: { type: 'ephemeral' },
          },
        ],
      }),
    );
    expect(result.content).toBe('Plan your trip to Lahore.');
    expect(result.usage).toEqual({
      inputTokens: 100,
      outputTokens: 20,
      cacheCreationInputTokens: 80,
      cacheReadInputTokens: 0,
    });
  });

  it('omits cache_control when ANTHROPIC_PROMPT_CACHING is false', async () => {
    configValues.ANTHROPIC_PROMPT_CACHING = 'false';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnthropicService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) =>
              configValues[key] ?? defaultValue,
            ),
            getOrThrow: jest.fn((key: string) => configValues[key]),
          },
        },
        {
          provide: CONVERSATION_EVENTS_CLIENT,
          useValue: eventsClient,
        },
      ],
    }).compile();

    const cachingDisabledService = module.get(AnthropicService);

    messagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Hello' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    });

    await cachingDisabledService.invoke({
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: 'Hi' }],
      stream: false,
      system: 'You are helpful.',
    });

    expect(messagesCreate).toHaveBeenCalledWith(
      expect.not.objectContaining({
        cache_control: expect.anything(),
      }),
    );
    expect(messagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: [{ type: 'text', text: 'You are helpful.' }],
      }),
    );

    configValues.ANTHROPIC_PROMPT_CACHING = 'true';
  });
});
