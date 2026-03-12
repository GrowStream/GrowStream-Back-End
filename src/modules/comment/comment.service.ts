import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(videoId: string, userId: string, text: string): Promise<Comment> {
    const comment = this.commentRepository.create({
      videoId,
      userId,
      text,
    });
    return this.commentRepository.save(comment);
  }

  async findByVideoId(videoId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { videoId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, userId: string, text: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    comment.text = text;
    return this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.commentRepository.remove(comment);
  }
}

