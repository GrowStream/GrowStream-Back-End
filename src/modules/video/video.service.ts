import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { VideoFile } from './entities/video-file.entity';
import { VideoView } from './entities/video-view.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoFile)
    private videoFileRepository: Repository<VideoFile>,
    @InjectRepository(VideoView)
    private videoViewRepository: Repository<VideoView>,
  ) {}

  async create(channelId: string, createVideoDto: any): Promise<Video> {
    return await this.videoRepository.save({
      ...createVideoDto,
      channelId
    });
  }

  async findAll(options?: { 
    page?: number; 
    limit?: number; 
    channelId?: string;
    visibility?: string;
  }): Promise<{ videos: Video[]; total: number }> {
    const { page = 1, limit = 10, channelId, visibility } = options || {};
    
    const queryBuilder = this.videoRepository.createQueryBuilder('video')
      .leftJoinAndSelect('video.channel', 'channel')
      .orderBy('video.createdAt', 'DESC');

    if (channelId) {
      queryBuilder.andWhere('video.channelId = :channelId', { channelId });
    }

    if (visibility) {
      queryBuilder.andWhere('video.visibility = :visibility', { visibility });
    } else {
      queryBuilder.andWhere('video.visibility = :visibility', { visibility: 'public' });
    }

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
      const view = this.videoViewRepository.create({
        videoId,
        userId,
        watchTime: 0,
      });
      await this.videoViewRepository.save(view);
    }
    
    return this.videoRepository.save(video);
  }

  async addVideoFile(videoId: string, fileData: Partial<VideoFile>): Promise<VideoFile> {
    const file = this.videoFileRepository.create({
      ...fileData,
      videoId,
    });
    return this.videoFileRepository.save(file);
  }

  async getVideoFiles(videoId: string): Promise<VideoFile[]> {
    return this.videoFileRepository.find({
      where: { videoId },
      order: { resolution: 'DESC' },
    });
  }

  async getTrendingVideos(limit: number = 10): Promise<Video[]> {
    return this.videoRepository.find({
      where: { visibility: 'public', status: 'published' },
      relations: ['channel'],
      order: { viewsCount: 'DESC' },
      take: limit,
    });
  }

  async getRecentVideos(limit: number = 10): Promise<Video[]> {
    return this.videoRepository.find({
      where: { visibility: 'public', status: 'published' },
      relations: ['channel'],
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }
}

