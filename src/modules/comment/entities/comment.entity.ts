import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Video } from '../../video/entities/video.entity';
import { Clip } from '../../clip/clip.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  videoId: string;

  @Column({ type: 'uuid', nullable: true })
  clipId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ default: 0 })
  likesCount: number;

  @ManyToOne(() => Video, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @ManyToOne(() => Clip, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'clipId' })
  clip: Clip;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CommentLike, (cl) => cl.comment)
  commentLikes: CommentLike[];

  @CreateDateColumn()
  createdAt: Date;
}
