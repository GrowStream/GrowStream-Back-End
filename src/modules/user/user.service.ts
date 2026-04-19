import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';
import { Channel } from '../channel/entities/channel.entity';

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

  async getContent(
    userId: string,
    type: 'videos' | 'clips' = 'videos',
    page = 1,
    limit = 50,
  ): Promise<{ items: any[]; total: number; type: string }> {
    const channel = await this.channelRepository.findOne({ where: { userId } });
    if (!channel) throw new NotFoundException('No channel found for this user');

    const channelId = channel.id;
    const skip = (page - 1) * limit;

    if (type === 'clips') {
      const [items, total] = await this.clipRepository.findAndCount({
        where: { channelId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });
      return { items, total, type };
    }

    // Default: videos
    const [items, total] = await this.videoRepository.findAndCount({
      where: { channelId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { items, total, type };
  }
}
