import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProviderInvokeDto, RmqPatterns } from '@app/shared';
import { AnthropicService } from './anthropic.service';

@Controller()
export class AnthropicController {
  constructor(private readonly anthropicService: AnthropicService) {}

  @MessagePattern(RmqPatterns.ANTHROPIC_INVOKE)
  invoke(@Payload() dto: ProviderInvokeDto) {
    return this.anthropicService.invoke(dto);
  }

  @MessagePattern(RmqPatterns.ANTHROPIC_STREAM)
  stream(@Payload() dto: ProviderInvokeDto) {
    return this.anthropicService.stream(dto);
  }
}
