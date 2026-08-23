export const RmqPatterns = {
  CONVERSATION_HANDLE: 'conversation.handle',
  CONVERSATION_STREAM: 'conversation.stream',
  ANTHROPIC_INVOKE: 'anthropic.invoke',
  ANTHROPIC_STREAM: 'anthropic.stream',
  AI_STREAM_CHUNK: 'ai.stream.chunk',
  AI_STREAM_END: 'ai.stream.end',
  AI_STREAM_ERROR: 'ai.stream.error',
  CONVERSATION_STREAM_CHUNK: 'conversation.stream.chunk',
  CONVERSATION_STREAM_END: 'conversation.stream.end',
  CONVERSATION_STREAM_ERROR: 'conversation.stream.error',
  SESSION_CREATE: 'session.create',
  SESSION_GET_MESSAGES: 'session.getMessages',
  SESSION_SEND_MESSAGE: 'session.sendMessage',
  SESSION_SEND_MESSAGE_STREAM: 'session.sendMessageStream',
} as const;

export type RmqPattern = (typeof RmqPatterns)[keyof typeof RmqPatterns];

export interface StreamChunkEvent {
  correlationId: string;
  chunk: string;
}

export interface StreamEndEvent {
  correlationId: string;
}

export interface StreamErrorEvent {
  correlationId: string;
  error: string;
}

export interface ProviderInvokeResponse {
  content: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    cacheCreationInputTokens?: number;
    cacheReadInputTokens?: number;
  };
}

export interface ConversationResponse {
  content: string;
  auditId: string;
  usage?: ProviderInvokeResponse['usage'];
}
