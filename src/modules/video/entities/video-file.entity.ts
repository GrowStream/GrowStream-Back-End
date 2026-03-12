import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Video } from './video.entity';

@Entity('video_files')
export class VideoFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resolution: string; // e.g., '1080p', '720p', '480p', '360p'

  @Column({ nullable: true })
  quality: string; // e.g., 'high', 'medium', 'low'

  @Column()
  format: string; // e.g., 'mp4', 'webm', 'm3u8'

  @Column()
  playlistUrl: string; // HLS playlist URL

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // in bytes

  @Column({ default: false })
  isOriginal: boolean;

  @Column({ default: true })
  isReady: boolean;

  @ManyToOne(() => Video, (video) => video.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Column()
  videoId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

