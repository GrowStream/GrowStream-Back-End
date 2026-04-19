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
import { Clip } from '../../clip/clip.entity';

@Entity('likes')
@Unique(['userId', 'videoId'])
@Unique(['userId', 'clipId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'like' })
  type: 'like' | 'dislike';

  @ManyToOne(() => Video, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column({ nullable: true })
  videoId: string;

  @ManyToOne(() => Clip, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'clipId' })
  clip: Clip;

  @Column({ nullable: true })
  clipId: string;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
