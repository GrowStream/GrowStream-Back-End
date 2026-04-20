import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Channel } from '../channel/entities/channel.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async create(userId: string, createDto: any): Promise<Post> {
    const channel = await this.channelRepository.findOne({ where: { userId } });
    if (!channel) throw new NotFoundException('Channel not found');

    return this.postRepository.save({
      ...createDto,
      channelId: channel.id,
    });
  }

  async findAll(channelId?: string): Promise<Post[]> {
    const where = channelId ? { channelId } : {};
    return this.postRepository.find({
      where,
      relations: ['channel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['channel'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, userId: string, updateData: any): Promise<Post> {
    const post = await this.findOne(id);
    if (post.channel.userId !== userId) throw new ForbiddenException();
    
    Object.assign(post, updateData);
    return this.postRepository.save(post);
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);
    if (post.channel.userId !== userId) throw new ForbiddenException();
    await this.postRepository.remove(post);
  }
}
