import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AiProvider,
  AiRequestStatus,
  MessageType,
} from '@app/shared';

@Entity('ai_requests')
export class AiRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  correlationId: string | null;

  @Column({ type: 'enum', enum: AiProvider })
  provider: AiProvider;

  @Column({ type: 'enum', enum: MessageType })
  messageType: MessageType;

  @Column({ type: 'varchar' })
  payloadHash: string;

  @Column({ type: 'enum', enum: AiRequestStatus, default: AiRequestStatus.PENDING })
  status: AiRequestStatus;

  @Column({ type: 'text', nullable: true })
  responseSummary: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
