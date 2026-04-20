import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Channel } from './channel.entity';

@Entity('subscriptions')
@Unique(['userId', 'channelId'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Channel, (channel) => channel.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  channelId: string;

  @CreateDateColumn()
  createdAt: Date;
}
