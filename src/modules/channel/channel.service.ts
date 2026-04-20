import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
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

  async subscribe(channelId: string, userId: string): Promise<Subscription> {
    const channel = await this.channelRepository.findOne({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');

    const existing = await this.subscriptionRepository.findOne({
      where: { channelId, userId },
    });

    if (existing) return existing;

    const sub = await this.subscriptionRepository.save(
      this.subscriptionRepository.create({ channelId, userId }),
    );

    // Increment count
    await this.channelRepository.increment({ id: channelId }, 'subscribersCount', 1);

    return sub;
  }

  async unsubscribe(channelId: string, userId: string): Promise<void> {
    const existing = await this.subscriptionRepository.findOne({
      where: { channelId, userId },
    });

    if (existing) {
      await this.subscriptionRepository.remove(existing);
      await this.channelRepository.decrement({ id: channelId }, 'subscribersCount', 1);
    }
  }

  async isSubscribed(channelId: string, userId: string): Promise<{ subscribed: boolean }> {
    const existing = await this.subscriptionRepository.findOne({
      where: { channelId, userId },
    });
    return { subscribed: !!existing };
  }
}
