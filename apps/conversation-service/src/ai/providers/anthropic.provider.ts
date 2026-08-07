import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProviderInvokeDto, ProviderInvokeResponse, RmqPatterns } from '@app/shared';
import { AiProviderClient } from '../interfaces/ai-provider-client.interface';
import { ANTHROPIC_CLIENT } from '../ai.constants';

@Injectable()
export class AnthropicProviderClient implements AiProviderClient {
  constructor(
    @Inject(ANTHROPIC_CLIENT) private readonly client: ClientProxy,
  ) {}

  invoke(payload: ProviderInvokeDto): Promise<ProviderInvokeResponse> {
    return firstValueFrom(this.client.send(RmqPatterns.ANTHROPIC_INVOKE, payload));
  }

  stream(payload: ProviderInvokeDto): Promise<{ started: true }> {
    return firstValueFrom(this.client.send(RmqPatterns.ANTHROPIC_STREAM, payload));
  }
}
