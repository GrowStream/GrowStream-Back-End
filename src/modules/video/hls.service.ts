import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { Video } from './entities/video.entity';
import { VideoFile } from './entities/video-file.entity';

@Injectable()
export class HlsService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoFile)
    private videoFileRepository: Repository<VideoFile>,
  ) {
    const ffmpegPath = configService.get<string>('FFMPEG_PATH');
    if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

    const ffprobePath = configService.get<string>('FFPROBE_PATH');
    if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);
  }

  /**
   * Fire-and-forget: convert a video to HLS and update the DB when done.
   * Call without await in the controller/service.
   */
  async processVideo(videoId: string, inputPath: string): Promise<void> {
    try {
      await this.videoRepository.update(videoId, { status: 'processing' });

      const hlsDir = join(process.cwd(), 'uploads', 'hls', videoId);
      if (!existsSync(hlsDir)) mkdirSync(hlsDir, { recursive: true });

      const outputM3u8 = join(hlsDir, 'index.m3u8');
      const segmentDuration = this.configService.get<number>('HLS_SEGMENT_DURATION', 6);
      const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
      const hlsUrl = `${appUrl}/uploads/hls/${videoId}/index.m3u8`;

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset fast',
            '-crf 23',
            '-sc_threshold 0',
            '-g 48',
            '-keyint_min 48',
            `-hls_time ${segmentDuration}`,
            '-hls_playlist_type vod',
            '-hls_segment_filename',
            join(hlsDir, 'segment%03d.ts'),
            '-f hls',
          ])
          .output(outputM3u8)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const duration = await this.probeDuration(inputPath);

      // Save VideoFile record for the HLS playlist
      await this.videoFileRepository.save(
        this.videoFileRepository.create({
          videoId,
          resolution: '720p',
          quality: 'medium',
          format: 'm3u8',
          playlistUrl: hlsUrl,
          fileSize: 0,
          isOriginal: false,
          isReady: true,
        }),
      );

      await this.videoRepository.update(videoId, {
        status: 'ready',
        duration,
        publishedAt: new Date(),
      });
    } catch (err) {
      console.error(`HLS conversion failed for video ${videoId}:`, err.message);
      await this.videoRepository.update(videoId, { status: 'failed' });
    }
  }

  async extractThumbnail(videoId: string, inputPath: string): Promise<string> {
    const outDir = join(process.cwd(), 'uploads', 'thumbnails');
    const outFile = `${videoId}.jpg`;
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['1'],
          filename: outFile,
          folder: outDir,
          size: '1280x720',
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    return `${appUrl}/uploads/thumbnails/${outFile}`;
  }

  private probeDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        resolve(Math.round(metadata.format.duration || 0));
      });
    });
  }
}
