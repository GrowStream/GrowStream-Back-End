import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveStream } from './entities/live-stream.entity';
import { Channel } from '../channel/entities/channel.entity';

@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveStream)
    private liveStreamRepository: Repository<LiveStream>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async create(userId: string, createDto: any): Promise<LiveStream> {
    const channel = await this.channelRepository.findOne({ where: { userId } });
    if (!channel) throw new NotFoundException('Channel not found');

    const streamKey = `sk_${Math.random().toString(36).substring(2, 15)}`;

    return this.liveStreamRepository.save({
      ...createDto,
      channelId: channel.id,
      streamKey,
      status: 'waiting',
    });
  }

  async findAll(): Promise<LiveStream[]> {
    return this.liveStreamRepository.find({
      where: { status: 'live' },
      relations: ['channel'],
      order: { startedAt: 'DESC' },
    });
  }

  async findByChannelId(channelId: string): Promise<LiveStream[]> {
    return this.liveStreamRepository.find({
      where: { channelId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LiveStream> {
    const stream = await this.liveStreamRepository.findOne({
      where: { id },
      relations: ['channel'],
    });
    if (!stream) throw new NotFoundException('Live stream not found');
    return stream;
  }

  async startStream(id: string, userId: string): Promise<LiveStream> {
    const stream = await this.findOne(id);
    if (stream.channel.userId !== userId) throw new ForbiddenException();

    stream.status = 'live';
    stream.startedAt = new Date();
    stream.streamUrl = `/live/${stream.id}/index.m3u8`;

    return this.liveStreamRepository.save(stream);
  }

  async endStream(id: string, userId: string): Promise<LiveStream> {
    const stream = await this.findOne(id);
    if (stream.channel.userId !== userId) throw new ForbiddenException();

    stream.status = 'ended';
    stream.endedAt = new Date();

    return this.liveStreamRepository.save(stream);
  }

  async delete(id: string, userId: string): Promise<void> {
    const stream = await this.findOne(id);
    if (stream.channel.userId !== userId) throw new ForbiddenException();
    await this.liveStreamRepository.remove(stream);
  }
}
