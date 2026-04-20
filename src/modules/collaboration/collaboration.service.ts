import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaboration } from './entities/collaboration.entity';
import { Channel } from '../channel/entities/channel.entity';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(Collaboration)
    private collabRepository: Repository<Collaboration>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async createRequest(userId: string, targetChannelId: string, dto: any): Promise<Collaboration> {
    const requesterChannel = await this.channelRepository.findOne({ where: { userId } });
    if (!requesterChannel) throw new NotFoundException('Requester channel not found');
    
    if (requesterChannel.id === targetChannelId) {
      throw new ForbiddenException('You cannot collaborate with yourself');
    }

    return this.collabRepository.save({
      ...dto,
      requesterChannelId: requesterChannel.id,
      targetChannelId,
      status: 'pending',
    });
  }

  async findAllForChannel(channelId: string): Promise<Collaboration[]> {
    return this.collabRepository.find({
      where: [
        { requesterChannelId: channelId },
        { targetChannelId: channelId }
      ],
      relations: ['requesterChannel', 'targetChannel'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Collaboration> {
    const collab = await this.collabRepository.findOne({
      where: { id },
      relations: ['requesterChannel', 'targetChannel'],
    });
    if (!collab) throw new NotFoundException('Collaboration not found');
    return collab;
  }

  async updateStatus(id: string, userId: string, status: 'active' | 'completed' | 'cancelled'): Promise<Collaboration> {
    const collab = await this.findOne(id);
    const userChannel = await this.channelRepository.findOne({ where: { userId } });
    
    if (!userChannel || (collab.requesterChannelId !== userChannel.id && collab.targetChannelId !== userChannel.id)) {
      throw new ForbiddenException();
    }
    
    collab.status = status;
    return this.collabRepository.save(collab);
  }
}
