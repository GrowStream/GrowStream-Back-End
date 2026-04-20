import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Clip)
    private clipRepository: Repository<Clip>,
  ) {}

  async create(userId: string, dto: any): Promise<Comment> {
    const comment = await this.commentRepository.save(
        this.commentRepository.create({
            ...dto,
            userId,
        } as Partial<Comment>)
    );

    if (dto.videoId) await this.updateCommentsCount(dto.videoId, null);
    if (dto.clipId) await this.updateCommentsCount(null, dto.clipId);

    return comment;
  }

  private async updateCommentsCount(videoId: string | null, clipId: string | null) {
    if (videoId) {
        const count = await this.commentRepository.count({ where: { videoId } });
        await this.videoRepository.update(videoId, { commentsCount: count });
    }
    if (clipId) {
        const count = await this.commentRepository.count({ where: { clipId } });
        await this.clipRepository.update(clipId, { commentsCount: count });
    }
  }

  async findByVideoId(videoId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { videoId, parentId: IsNull() },
      relations: ['user', 'commentLikes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClipId(clipId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { clipId, parentId: IsNull() },
      relations: ['user', 'commentLikes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReplies(parentId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { parentId },
      relations: ['user', 'commentLikes'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: id } as any });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new Error('Unauthorized');
    
    const videoId = comment.videoId;
    const clipId = comment.clipId;
    
    await this.commentRepository.remove(comment);

    if (videoId) await this.updateCommentsCount(videoId, null);
    if (clipId) await this.updateCommentsCount(null, clipId);
  }
}
