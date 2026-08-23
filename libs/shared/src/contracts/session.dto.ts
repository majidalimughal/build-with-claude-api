import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AiProvider } from '../enums/ai-provider.enum';
import { MessageRole } from '../enums/message-role.enum';
import { SystemPromptType } from '../enums/system-prompt-type.enum';

export class CreateSessionDto {
  @IsOptional()
  @IsEnum(AiProvider)
  provider?: AiProvider;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(SystemPromptType)
  systemPromptType?: SystemPromptType;
}

export class SendSessionMessageDto {
  @IsString()
  content: string;
}

export interface SessionResponse {
  id: string;
  provider: AiProvider;
  model: string | null;
  title: string | null;
  systemPromptType: SystemPromptType;
  createdAt: Date;
}

export interface SessionMessageResponse {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface ChatResponse {
  sessionId: string;
  userMessage: SessionMessageResponse;
  assistantMessage: SessionMessageResponse;
  auditId: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface SessionGetMessagesPayload {
  sessionId: string;
}

export interface SessionSendMessagePayload {
  sessionId: string;
  content: string;
}

export interface SessionSendMessageStreamPayload {
  sessionId: string;
  content: string;
  correlationId?: string;
}
