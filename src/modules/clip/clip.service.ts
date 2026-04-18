import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { Clip } from './clip.entity';
import { Channel } from '../channel/entities/channel.entity';
import { HlsService } from '../video/hls.service';

@Injectable()
export class ClipService {
  constructor(
    @InjectRepository(Clip)
    private clipRepository: Repository<Clip>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private hlsService: HlsService,
  ) {}

  async create(userId: string, createDto: any): Promise<Clip> {
    const channel = await this.channelRepository.findOne({ where: { userId } });
    if (!channel) throw new NotFoundException('No channel found. Please create a channel first.');

    const clip = await this.clipRepository.save(
      this.clipRepository.create({ ...createDto, channelId: channel.id, status: 'pending' }),
    );

    // Trigger HLS conversion and thumbnail extraction if file path provided
    if (createDto.videoFilePath) {
      const inputPath = join(process.cwd(), createDto.videoFilePath.replace(/^\//, ''));

      if (!clip.thumbnail) {
        this.hlsService
          .extractThumbnail(clip.id, inputPath)
          .then((thumbUrl) => this.clipRepository.update(clip.id, { thumbnail: thumbUrl }))
          .catch((err) => console.error('Clip thumbnail extraction failed:', err.message));
      }

      // HLS conversion — updates clip via direct repository call won't work
      // since HlsService targets videos table. We handle the clip separately below.
      this.convertClipToHLS(clip.id, inputPath).catch(() => {});
    }

    return clip;
  }

  private async convertClipToHLS(clipId: string, inputPath: string): Promise<void> {
    const { join: pathJoin } = require('path');
    const { mkdirSync, existsSync } = require('fs');
    const ffmpeg = require('fluent-ffmpeg');

    try {
      await this.clipRepository.update(clipId, { status: 'processing' });

      const hlsDir = pathJoin(process.cwd(), 'uploads', 'hls', 'clips', clipId);
      if (!existsSync(hlsDir)) mkdirSync(hlsDir, { recursive: true });

      const outputM3u8 = pathJoin(hlsDir, 'index.m3u8');

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset fast',
            '-crf 23',
            '-vf', 'scale=-2:1080',
            '-hls_time 4',
            '-hls_playlist_type vod',
            '-hls_segment_filename', pathJoin(hlsDir, 'segment%03d.ts'),
            '-f hls',
          ])
          .output(outputM3u8)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      await this.clipRepository.update(clipId, {
        status: 'ready',
        hlsUrl: `/uploads/hls/clips/${clipId}/index.m3u8`,
      });
    } catch (err) {
      console.error(`Clip HLS conversion failed for ${clipId}:`, err.message);
      await this.clipRepository.update(clipId, { status: 'failed' });
    }
  }

  async findAll(options?: { page?: number; limit?: number; channelId?: string }): Promise<{ clips: Clip[]; total: number }> {
    const { page = 1, limit = 20, channelId } = options || {};

    const queryBuilder = this.clipRepository
      .createQueryBuilder('clip')
      .leftJoinAndSelect('clip.channel', 'channel')
      .where('clip.status = :status', { status: 'ready' })
      .orderBy('clip.createdAt', 'DESC');

    if (channelId) {
      queryBuilder.andWhere('clip.channelId = :channelId', { channelId });
    }

    const total = await queryBuilder.getCount();
    const clips = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { clips, total };
  }

  async findById(id: string): Promise<Clip> {
    const clip = await this.clipRepository.findOne({
      where: { id },
      relations: ['channel'],
    });
    if (!clip) throw new NotFoundException('Clip not found');
    return clip;
  }

  async findByChannelId(channelId: string): Promise<Clip[]> {
    return this.clipRepository.find({
      where: { channelId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const clip = await this.clipRepository.findOne({
      where: { id },
      relations: ['channel'],
    });
    if (!clip) throw new NotFoundException('Clip not found');
    if (clip.channel.userId !== userId) throw new ForbiddenException('You can only delete your own clips');
    await this.clipRepository.remove(clip);
  }

  async incrementViews(clipId: string): Promise<void> {
    await this.clipRepository.increment({ id: clipId }, 'viewsCount', 1);
  }
}
