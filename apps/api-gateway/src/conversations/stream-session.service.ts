import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface StreamMessage {
  data: unknown;
}

export interface StreamSession {
  subject: Subject<StreamMessage>;
  createdAt: number;
}

@Injectable()
export class StreamSessionService {
  private readonly sessions = new Map<string, StreamSession>();

  register(correlationId: string): Subject<StreamMessage> {
    const subject = new Subject<StreamMessage>();
    this.sessions.set(correlationId, {
      subject,
      createdAt: Date.now(),
    });
    return subject;
  }

  get(correlationId: string): Subject<StreamMessage> | undefined {
    return this.sessions.get(correlationId)?.subject;
  }

  close(correlationId: string): void {
    const session = this.sessions.get(correlationId);
    if (session) {
      session.subject.complete();
      this.sessions.delete(correlationId);
    }
  }
}
