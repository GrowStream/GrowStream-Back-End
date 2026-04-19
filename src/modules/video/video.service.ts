import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { Video } from './entities/video.entity';
import { VideoFile } from './entities/video-file.entity';
import { VideoView } from './entities/video-view.entity';
import { Channel } from '../channel/entities/channel.entity';
import { HlsService } from './hls.service';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoFile)
    private videoFileRepository: Repository<VideoFile>,
    @InjectRepository(VideoView)
    private videoViewRepository: Repository<VideoView>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private hlsService: HlsService,
  ) {}

  async create(userId: string, createVideoDto: any): Promise<Video> {
    // Look up the user's channel (one channel per user)
    const channel = await this.channelRepository.findOne({ where: { userId } });
    if (!channel) {
      throw new NotFoundException('No channel found. Please create a channel first.');
    }

    const video = await this.videoRepository.save({
      ...createVideoDto,
      channelId: channel.id,
      status: 'pending',
    });

    // If the request included the local file path, start HLS conversion async
    if (createVideoDto.videoFilePath) {
      const inputPath = join(process.cwd(), createVideoDto.videoFilePath.replace(/^\//, ''));
      // Auto-extract thumbnail if none provided
      if (!video.thumbnail) {
        this.hlsService
          .extractThumbnail(video.id, inputPath)
          .then((thumbUrl) => this.videoRepository.update(video.id, { thumbnail: thumbUrl }))
          .catch((err) => console.error('Thumbnail extraction failed:', err.message));
      }
      // HLS conversion (fire and forget)
      this.hlsService.processVideo(video.id, inputPath).catch(() => {});
    }

    return video;
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    channelId?: string;
    visibility?: string;
  }): Promise<{ videos: Video[]; total: number }> {
    const { page = 1, limit = 10, channelId, visibility } = options || {};

    const queryBuilder = this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.channel', 'channel')
      .orderBy('video.createdAt', 'DESC');

    if (channelId) {
      queryBuilder.andWhere('video.channelId = :channelId', { channelId });
    }

    queryBuilder.andWhere('video.visibility = :visibility', {
      visibility: visibility || 'public',
    });

    const total = await queryBuilder.getCount();
    const videos = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { videos, total };
  }

  async findById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['channel', 'files', 'views'],
    });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async findByChannelId(channelId: string): Promise<Video[]> {
    return this.videoRepository.find({
      where: { channelId },
      relations: ['files'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: string, updateData: Partial<Video>): Promise<Video> {
    const video = await this.findById(id);

    if (video.channel.userId !== userId) {
      throw new ForbiddenException('You can only update your own videos');
    }

    Object.assign(video, updateData);
    return this.videoRepository.save(video);
  }

  async delete(id: string, userId: string): Promise<void> {
    const video = await this.findById(id);

    if (video.channel.userId !== userId) {
      throw new ForbiddenException('You can only delete your own videos');
    }

    await this.videoRepository.remove(video);
  }

  async incrementViews(videoId: string, userId?: string): Promise<Video> {
    const video = await this.findById(videoId);
    video.viewsCount += 1;

    if (userId) {
      const view = this.videoViewRepository.create({ videoId, userId, watchTime: 0 });
      await this.videoViewRepository.save(view);
    }

    return this.videoRepository.save(video);
  }

  async addVideoFile(videoId: string, fileData: Partial<VideoFile>): Promise<VideoFile> {
    const file = this.videoFileRepository.create({ ...fileData, videoId });
    return this.videoFileRepository.save(file);
  }

  async getVideoFiles(videoId: string): Promise<VideoFile[]> {
    return this.videoFileRepository.find({
      where: { videoId },
      order: { resolution: 'DESC' },
    });
  }

  async getTrendingVideos(limit = 10): Promise<Video[]> {
    return this.videoRepository.find({
      where: { visibility: 'public', status: 'published' },
      relations: ['channel'],
      order: { viewsCount: 'DESC' },
      take: limit,
    });
  }

  async getRecentVideos(limit = 10): Promise<Video[]> {
    return this.videoRepository.find({
      where: { visibility: 'public', status: 'published' },
      relations: ['channel'],
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }
}
