import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaboration } from './entities/collaboration.entity';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { Channel } from '../channel/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collaboration, Channel])],
  controllers: [CollaborationController],
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
