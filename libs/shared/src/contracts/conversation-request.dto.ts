import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AiProvider } from '../enums/ai-provider.enum';
import { MessageType } from '../enums/message-type.enum';
import { SystemPromptType } from '../enums/system-prompt-type.enum';

export class MessageDto {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

export class ConversationRequestDto {
  @IsOptional()
  @IsEnum(AiProvider)
  provider?: AiProvider;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  @IsEnum(SystemPromptType)
  systemPromptType?: SystemPromptType;
}
