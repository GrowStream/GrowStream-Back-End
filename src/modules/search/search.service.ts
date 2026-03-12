import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Video } from '../video/entities/video.entity';
import { Channel } from '../channel/entities/channel.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async searchVideos(query: string, limit: number = 20) {
    return this.videoRepository.find({
      where: [
        { title: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
        { tags: ILike(`%${query}%`) },
      ],
      relations: ['channel'],
      order: { viewsCount: 'DESC' },
      take: limit,
    });
  }

  async searchChannels(query: string, limit: number = 20) {
    return this.channelRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
      ],
      relations: ['user'],
      order: { subscribersCount: 'DESC' },
      take: limit,
    });
  }

  async searchAll(query: string) {
    const [videos, channels] = await Promise.all([
      this.searchVideos(query, 10),
      this.searchChannels(query, 10),
    ]);

    return {
      videos,
      channels,
      total: videos.length + channels.length,
    };
  }
}

