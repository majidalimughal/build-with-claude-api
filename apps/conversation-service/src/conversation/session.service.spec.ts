import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  ConversationMessage,
  ConversationSession,
} from '@app/database';
import {
  AiProvider,
  MessageRole,
  MessageType,
} from '@app/shared';
import { AiProviderFactory } from '../ai/ai-provider.factory';
import { AuditService } from './audit.service';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  const session: ConversationSession = {
    id: 'session-1',
    provider: AiProvider.ANTHROPIC,
    model: null,
    title: 'Test',
    messages: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const messages: ConversationMessage[] = [];
  const providerClient = {
    invoke: jest.fn().mockResolvedValue({
      content: 'Hi there',
      usage: { inputTokens: 1, outputTokens: 2 },
    }),
    stream: jest.fn(),
  };

  const sessionRepository = {
    create: jest.fn((data) => ({ ...session, ...data, id: 'session-1' })),
    save: jest.fn(async (entity) => entity),
    findOne: jest.fn(async () => session),
  };

  const messageRepository = {
    create: jest.fn((data) => ({
      id: `msg-${messages.length + 1}`,
      createdAt: new Date(),
      ...data,
    })),
    save: jest.fn(async (entity) => {
      messages.push(entity);
      return entity;
    }),
    find: jest.fn(async () => [...messages]),
  };

  const auditService = {
    createPending: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    markProcessing: jest.fn(),
    markCompleted: jest.fn(),
    markFailed: jest.fn(),
  };

  const aiProviderFactory = {
    getProvider: jest.fn(() => providerClient),
  };

  beforeEach(async () => {
    messages.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: getRepositoryToken(ConversationSession), useValue: sessionRepository },
        { provide: getRepositoryToken(ConversationMessage), useValue: messageRepository },
        { provide: AiProviderFactory, useValue: aiProviderFactory },
        { provide: AuditService, useValue: auditService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('claude-haiku-4-5') },
        },
      ],
    }).compile();

    service = module.get(SessionService);
  });

  it('creates a session', async () => {
    const result = await service.create({
      provider: AiProvider.ANTHROPIC,
      title: 'Test',
    });

    expect(result.id).toBe('session-1');
    expect(result.provider).toBe(AiProvider.ANTHROPIC);
  });

  it('loads history and saves user and assistant messages on sendMessage', async () => {
    const result = await service.sendMessage({
      sessionId: 'session-1',
      content: 'Hello',
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe(MessageRole.USER);
    expect(messages[1].role).toBe(MessageRole.ASSISTANT);
    expect(providerClient.invoke).toHaveBeenCalledWith({
      model: 'claude-haiku-4-5',
      messages: [{ role: MessageRole.USER, content: 'Hello' }],
      stream: false,
      correlationId: undefined,
    });
    expect(auditService.createPending).toHaveBeenCalledWith(
      expect.objectContaining({ messageType: MessageType.CONVERSATION }),
    );
    expect(result.assistantMessage.content).toBe('Hi there');
  });

  it('includes prior turns when sending a follow-up message', async () => {
    await service.sendMessage({ sessionId: 'session-1', content: 'Hello' });
    await service.sendMessage({ sessionId: 'session-1', content: 'Again' });

    expect(providerClient.invoke).toHaveBeenLastCalledWith({
      model: 'claude-haiku-4-5',
      messages: [
        { role: MessageRole.USER, content: 'Hello' },
        { role: MessageRole.ASSISTANT, content: 'Hi there' },
        { role: MessageRole.USER, content: 'Again' },
      ],
      stream: false,
      correlationId: undefined,
    });
  });

  it('persists streamed assistant reply on completeStream', async () => {
    await service.startMessageStream({
      sessionId: 'session-1',
      content: 'Stream me',
      correlationId: 'corr-1',
    });

    service.appendStreamChunk('corr-1', 'Hello');
    service.appendStreamChunk('corr-1', ' world');
    await service.completeStream('corr-1');

    expect(messages.at(-1)).toEqual(
      expect.objectContaining({
        role: MessageRole.ASSISTANT,
        content: 'Hello world',
      }),
    );
    expect(auditService.markCompleted).toHaveBeenCalledWith('audit-1', 'Hello world');
  });
});
