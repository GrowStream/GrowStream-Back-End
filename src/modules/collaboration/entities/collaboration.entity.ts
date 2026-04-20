import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Channel } from '../../channel/entities/channel.entity';

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'active' | 'completed' | 'cancelled';

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requesterChannelId' })
  requesterChannel: Channel;

  @Column()
  requesterChannelId: string;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetChannelId' })
  targetChannel: Channel;

  @Column()
  targetChannelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
