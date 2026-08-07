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

  it('validates provider invoke dto', async () => {
    const dto = plainToInstance(ProviderInvokeDto, {
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('validates session dtos', async () => {
    const createDto = plainToInstance(CreateSessionDto, {
      provider: AiProvider.ANTHROPIC,
      title: 'My chat',
    });
    const messageDto = plainToInstance(SendSessionMessageDto, {
      content: 'Hello',
    });

    await expect(validate(createDto)).resolves.toHaveLength(0);
    await expect(validate(messageDto)).resolves.toHaveLength(0);
  });
});
