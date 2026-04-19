import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
  ) {}

  async create(videoId: string, userId: string, text: string, parentId?: string): Promise<Comment> {
    const comment = this.commentRepository.create({ videoId, userId, text, parentId: parentId ?? null });
    return this.commentRepository.save(comment);
  }

  async findByVideoId(videoId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { videoId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, userId: string, text: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.text = text;
    return this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepository.remove(comment);
  }

  async likeComment(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    const existing = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (existing) {
      await this.commentLikeRepository.remove(existing);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      await this.commentRepository.save(comment);
      return { liked: false, likesCount: comment.likesCount };
    }

    await this.commentLikeRepository.save(
      this.commentLikeRepository.create({ commentId, userId }),
    );
    comment.likesCount += 1;
    await this.commentRepository.save(comment);
    return { liked: true, likesCount: comment.likesCount };
  }
}
