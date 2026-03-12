import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async create(userId: string, createChannelDto: any): Promise<Channel> {
    return await this.channelRepository.save({
      ...createChannelDto,
      userId
    });
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id },
      relations: ['user', 'videos'],
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  async findByUserId(userId: string): Promise<Channel[]> {
    return this.channelRepository.find({
      where: { userId },
      relations: ['videos'],
    });
  }

  async update(id: string, userId: string, updateData: Partial<Channel>): Promise<Channel> {
    const channel = await this.findById(id);
    
    if (channel.userId !== userId) {
      throw new ForbiddenException('You can only update your own channel');
    }
    
    Object.assign(channel, updateData);
    return this.channelRepository.save(channel);
  }

  async delete(id: string, userId: string): Promise<void> {
    const channel = await this.findById(id);
    
    if (channel.userId !== userId) {
      throw new ForbiddenException('You can only delete your own channel');
    }
    
    await this.channelRepository.remove(channel);
  }

  async subscribe(channelId: string): Promise<Channel> {
    const channel = await this.findById(channelId);
    channel.subscribersCount += 1;
    return this.channelRepository.save(channel);
  }

  async unsubscribe(channelId: string): Promise<Channel> {
    const channel = await this.findById(channelId);
    if (channel.subscribersCount > 0) {
      channel.subscribersCount -= 1;
    }
    return this.channelRepository.save(channel);
  }
}

