import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Channel } from '../../channel/entities/channel.entity';
import { VideoFile } from './video-file.entity';
import { VideoView } from './video-view.entity';
import { VideoTag } from './video-tag.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  videoUrl: string; // URL of the original uploaded file

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ default: 'public' })
  visibility: 'public' | 'private' | 'unlisted';

  @Column({ default: false })
  ageRestriction: boolean;

  @Column({ default: 'pending' })
  status: 'pending' | 'processing' | 'ready' | 'failed' | 'published';

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  dislikesCount: number;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  playlist: string; // JSON array: ['videos', 'clips']

  @Column({ nullable: true })
  tags: string; // JSON array of tags

  @Column({ nullable: true })
  note: string; // Schedule note

  @ManyToOne(() => Channel, (channel) => channel.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  channelId: string;

  @OneToMany(() => VideoFile, (file) => file.video)
  files: VideoFile[];

  @OneToMany(() => VideoView, (view) => view.video)
  views: VideoView[];

  @OneToMany(() => VideoTag, (videoTag) => videoTag.video)
  videoTags: VideoTag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

