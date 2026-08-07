import { Test, TestingModule } from '@nestjs/testing';
import { AnthropicController } from './anthropic.controller';
import { AnthropicService } from './anthropic.service';

describe('AnthropicController', () => {
  let controller: AnthropicController;
  const anthropicService = {
    invoke: jest.fn().mockResolvedValue({ content: 'Hello', usage: {} }),
    stream: jest.fn().mockResolvedValue({ started: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnthropicController],
      providers: [
        {
          provide: AnthropicService,
          useValue: anthropicService,
        },
      ],
    }).compile();

    controller = module.get(AnthropicController);
  });

  it('delegates invoke to anthropic service', async () => {
    const payload = {
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: 'Hi' }],
      stream: false,
    };

    await expect(controller.invoke(payload)).resolves.toEqual({
      content: 'Hello',
      usage: {},
    });
    expect(anthropicService.invoke).toHaveBeenCalledWith(payload);
  });
});
