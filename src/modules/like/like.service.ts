import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Clip)
    private clipRepository: Repository<Clip>,
  ) {}

  async likeVideo(videoId: string, userId: string): Promise<Like | null> {
    const result = await this.toggleLike({ videoId, userId, type: 'like' });
    await this.updateCounts(videoId, null);
    return result;
  }

  async dislikeVideo(videoId: string, userId: string): Promise<Like | null> {
    const result = await this.toggleLike({ videoId, userId, type: 'dislike' });
    await this.updateCounts(videoId, null);
    return result;
  }

  async likeClip(clipId: string, userId: string): Promise<Like | null> {
    const result = await this.toggleLike({ clipId, userId, type: 'like' });
    await this.updateCounts(null, clipId);
    return result;
  }

  async dislikeClip(clipId: string, userId: string): Promise<Like | null> {
    const result = await this.toggleLike({ clipId, userId, type: 'dislike' });
    await this.updateCounts(null, clipId);
    return result;
  }

  private async toggleLike(options: { videoId?: string; clipId?: string; userId: string; type: 'like' | 'dislike' }): Promise<Like | null> {
    const { videoId, clipId, userId, type } = options;
    const where = videoId ? { videoId, userId } : { clipId, userId };

    const existing = await this.likeRepository.findOne({ where });

    if (existing) {
      if (existing.type === type) {
        await this.likeRepository.remove(existing);
        return null;
      }
      existing.type = type;
      return this.likeRepository.save(existing);
    }

    const like = this.likeRepository.create({ ...options });
    return this.likeRepository.save(like);
  }

  private async updateCounts(videoId: string | null, clipId: string | null) {
    if (videoId) {
      const likes = await this.likeRepository.count({ where: { videoId, type: 'like' } });
      const dislikes = await this.likeRepository.count({ where: { videoId, type: 'dislike' } });
      await this.videoRepository.update(videoId, { likesCount: likes, dislikesCount: dislikes });
    }
    if (clipId) {
      const likes = await this.likeRepository.count({ where: { clipId, type: 'like' } });
      const dislikes = await this.likeRepository.count({ where: { clipId, type: 'dislike' } });
      await this.clipRepository.update(clipId, { likesCount: likes, dislikesCount: dislikes });
    }
  }

  async getLikesByVideoId(videoId: string): Promise<Like[]> {
    return this.likeRepository.find({
      where: { videoId },
      relations: ['user'],
    });
  }

  async getLikesByClipId(clipId: string): Promise<Like[]> {
    return this.likeRepository.find({
      where: { clipId },
      relations: ['user'],
    });
  }

  async getUserLike(videoId: string, userId: string): Promise<Like | null> {
    return this.likeRepository.findOne({
      where: { videoId, userId },
    });
  }

  async getUserClipLike(clipId: string, userId: string): Promise<Like | null> {
    return this.likeRepository.findOne({
      where: { clipId, userId },
    });
  }
}
