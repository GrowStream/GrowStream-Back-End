import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

async likeVideo(videoId: string, userId: string): Promise<Like | null> {
    const existing = await this.likeRepository.findOne({
      where: { videoId, userId },
    });

    if (existing) {
      if (existing.type === 'like') {
        // Already liked - remove the like
        await this.likeRepository.remove(existing);
        return null;
      }
      // Was dislike - change to like
      existing.type = 'like';
      return this.likeRepository.save(existing);
    }

    const like = this.likeRepository.create({
      videoId,
      userId,
      type: 'like',
    });
    return this.likeRepository.save(like);
  }

async dislikeVideo(videoId: string, userId: string): Promise<Like | null> {
    const existing = await this.likeRepository.findOne({
      where: { videoId, userId },
    });

    if (existing) {
      if (existing.type === 'dislike') {
        // Already disliked - remove
        await this.likeRepository.remove(existing);
        return null;
      }
      // Was like - change to dislike
      existing.type = 'dislike';
      return this.likeRepository.save(existing);
    }

    const like = this.likeRepository.create({
      videoId,
      userId,
      type: 'dislike',
    });
    return this.likeRepository.save(like);
  }

  async getLikesByVideoId(videoId: string): Promise<Like[]> {
    return this.likeRepository.find({
      where: { videoId },
      relations: ['user'],
    });
  }

  async getUserLike(videoId: string, userId: string): Promise<Like | null> {
    return this.likeRepository.findOne({
      where: { videoId, userId },
    });
  }

  async removeLike(videoId: string, userId: string): Promise<void> {
    const like = await this.likeRepository.findOne({
      where: { videoId, userId },
    });
    if (like) {
      await this.likeRepository.remove(like);
    }
  }
}

