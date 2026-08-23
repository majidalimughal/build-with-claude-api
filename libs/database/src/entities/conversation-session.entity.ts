import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AiProvider, SystemPromptType } from '@app/shared';
import { ConversationMessage } from './conversation-message.entity';

@Entity('conversation_sessions')
export class ConversationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AiProvider })
  provider: AiProvider;

  @Column({ type: 'varchar', nullable: true })
  model: string | null;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({
    type: 'enum',
    enum: SystemPromptType,
    default: SystemPromptType.TRAVEL_AGENT_PAKISTAN,
  })
  systemPromptType: SystemPromptType;

  @OneToMany(() => ConversationMessage, (message) => message.session)
  messages: ConversationMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
