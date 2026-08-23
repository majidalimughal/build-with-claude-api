import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  ConversationRequestDto,
  CreateSessionDto,
  ProviderInvokeDto,
  SendSessionMessageDto,
  AiProvider,
  MessageType,
  SystemPromptType,
  resolveSystemPrompt,
  SYSTEM_PROMPTS,
  DEFAULT_SYSTEM_PROMPT_TYPE,
} from './index';

describe('Shared DTOs', () => {
  it('validates conversation request dto', async () => {
    const dto = plainToInstance(ConversationRequestDto, {
      provider: AiProvider.ANTHROPIC,
      messageType: MessageType.ONE_SHOT,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('validates conversation request dto without provider', async () => {
    const dto = plainToInstance(ConversationRequestDto, {
      messageType: MessageType.ONE_SHOT,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('validates conversation request dto with systemPromptType', async () => {
    const dto = plainToInstance(ConversationRequestDto, {
      provider: AiProvider.ANTHROPIC,
      messageType: MessageType.ONE_SHOT,
      systemPromptType: SystemPromptType.TRAVEL_AGENT_PAKISTAN,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('validates provider invoke dto with system prompt', async () => {
    const dto = plainToInstance(ProviderInvokeDto, {
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false,
      system: 'You are a travel agent.',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('validates session dtos', async () => {
    const createDto = plainToInstance(CreateSessionDto, {
      provider: AiProvider.ANTHROPIC,
      title: 'My chat',
      systemPromptType: SystemPromptType.TRAVEL_AGENT_PAKISTAN,
    });
    const createWithoutProvider = plainToInstance(CreateSessionDto, {
      title: 'My chat',
    });
    const messageDto = plainToInstance(SendSessionMessageDto, {
      content: 'Hello',
    });

    await expect(validate(createDto)).resolves.toHaveLength(0);
    await expect(validate(createWithoutProvider)).resolves.toHaveLength(0);
    await expect(validate(messageDto)).resolves.toHaveLength(0);
  });
});

describe('resolveSystemPrompt', () => {
  it('defaults to travel agent pakistan', () => {
    expect(resolveSystemPrompt()).toBe(
      SYSTEM_PROMPTS[SystemPromptType.TRAVEL_AGENT_PAKISTAN],
    );
    expect(resolveSystemPrompt(undefined)).toBe(
      SYSTEM_PROMPTS[DEFAULT_SYSTEM_PROMPT_TYPE],
    );
  });

  it('resolves explicit system prompt type', () => {
    expect(resolveSystemPrompt(SystemPromptType.TRAVEL_AGENT_PAKISTAN)).toBe(
      SYSTEM_PROMPTS[SystemPromptType.TRAVEL_AGENT_PAKISTAN],
    );
  });
});
