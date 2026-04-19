import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';
import { Channel } from '../channel/entities/channel.entity';
import { LiveStream } from '../live/entities/live-stream.entity';
import { Post } from '../post/entities/post.entity';
import { Collaboration } from '../collaboration/entities/collaboration.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Clip)
    private clipRepository: Repository<Clip>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(LiveStream)
    private liveStreamRepository: Repository<LiveStream>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Collaboration)
    private collabRepository: Repository<Collaboration>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['channels'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async getContent(userId: string, type = 'videos', page = 1, limit = 10) {
    const channel = await this.channelRepository.findOne({ where: { userId } });
    if (!channel) throw new NotFoundException('Channel not found');

    const channelId = channel.id;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 10;
    const skip = (numericPage - 1) * numericLimit;

    let items = [];
    let total = 0;

    switch (type) {
      case 'clips':
        [items, total] = await this.clipRepository.findAndCount({
          where: { channelId },
          order: { createdAt: 'DESC' },
          skip,
          take: numericLimit,
        });
        break;
      case 'live':
        [items, total] = await this.liveStreamRepository.findAndCount({
          where: { channelId },
          order: { createdAt: 'DESC' },
          skip,
          take: numericLimit,
        });
        break;
      case 'posts':
        [items, total] = await this.postRepository.findAndCount({
          where: { channelId },
          order: { createdAt: 'DESC' },
          skip,
          take: numericLimit,
        });
        break;
      case 'collaborations':
        [items, total] = await this.collabRepository.findAndCount({
          where: [
            { requesterChannelId: channelId },
            { targetChannelId: channelId }
          ],
          relations: ['requesterChannel', 'targetChannel'],
          order: { createdAt: 'DESC' },
          skip,
          take: numericLimit,
        });
        break;
      default: // videos
        [items, total] = await this.videoRepository.findAndCount({
          where: { channelId },
          relations: ['files'],
          order: { createdAt: 'DESC' },
          skip,
          take: numericLimit,
        });
    }

    return { items, total, type };
  }
}
