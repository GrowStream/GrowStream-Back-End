import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Video } from '../../video/entities/video.entity';
import { User } from '../../user/entities/user.entity';

@Entity('likes')
@Unique(['userId', 'videoId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'like' })
  type: 'like' | 'dislike';

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column()
  videoId: string;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}

