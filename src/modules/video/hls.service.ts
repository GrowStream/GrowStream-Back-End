import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ffmpeg from 'fluent-ffmpeg';
import { join, isAbsolute } from 'path';
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
    console.log(`[CONFIG] FFMPEG_PATH: ${ffmpegPath || 'Not set (using PATH)'}`);
    if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

    const ffprobePath = configService.get<string>('FFPROBE_PATH');
    console.log(`[CONFIG] FFPROBE_PATH: ${ffprobePath || 'Not set (using PATH)'}`);
    if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);
  }

  async processVideo(videoId: string, inputPath: string): Promise<void> {
    try {
      console.log(`[HLS] Starting: ${videoId} | Path: ${inputPath}`);
      await this.videoRepository.update(videoId, { status: 'processing' });

      // 1. Extract Thumbnail first
      try {
        const thumbUrl = await this.extractThumbnail(videoId, inputPath);
        await this.videoRepository.update(videoId, { thumbnail: thumbUrl });
        console.log(`[HLS] Thumbnail extracted for ${videoId}`);
      } catch (thumbErr) {
        console.error(`[HLS] Thumbnail extraction failed for ${videoId}:`, thumbErr.message);
      }

      // 2. Setup HLS directory
      const hlsDir = join(process.cwd(), 'uploads', 'hls', videoId);
      if (!existsSync(hlsDir)) mkdirSync(hlsDir, { recursive: true });

      const outputM3u8 = join(hlsDir, 'index.m3u8');
      const segmentDuration = this.configService.get<number>('HLS_SEGMENT_DURATION', 4);
      const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
      const hlsUrl = `${appUrl}/uploads/hls/${videoId}/index.m3u8`;

      // 3. Run HLS Conversion
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset', 'ultrafast',
            '-crf', '28',
            '-vf', 'scale=-2:720',
            '-hls_time', segmentDuration.toString(),
            '-hls_playlist_type', 'vod',
            '-hls_segment_filename', join(hlsDir, 'segment%03d.ts'),
            '-f', 'hls',
          ])
          .output(outputM3u8)
          .on('start', (cmd) => console.log(`[FFMPEG] Command: ${cmd}`))
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const duration = await this.probeDuration(inputPath);

      // 4. Save VideoFile record
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

      // 5. Mark as ready
      await this.videoRepository.update(videoId, {
        status: 'ready',
        duration,
        publishedAt: new Date(),
      });
      console.log(`[HLS] Success: ${videoId} is now Ready.`);
    } catch (err) {
      // FIX 1: Mark as failed instead of falling back to 'ready'
      console.error(`[HLS] Failed: ${videoId} | Error: ${err.message}`);
      await this.videoRepository.update(videoId, { status: 'failed' });
      console.error(`[HLS] Video ${videoId} marked as 'failed'. Check FFmpeg logs above.`);
    }
  }

  async extractThumbnail(videoId: string, inputPath: string): Promise<string> {
    const outDir = join(process.cwd(), 'uploads', 'thumbnails');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const outFile = `${videoId}.jpg`;
    const appUrl = this.configService.get('APP_URL', 'http://localhost:3000');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .screenshots({
          timestamps: ['1'],
          filename: outFile,
          folder: outDir,
          size: '640x360',
        });
    });

    return `${appUrl}/uploads/thumbnails/${outFile}`;
  }

  private probeDuration(filePath: string): Promise<number> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return resolve(0);
        resolve(Math.round(metadata.format.duration || 0));
      });
    });
  }
}