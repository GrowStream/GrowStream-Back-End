import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clip } from './clip.entity';
import { ClipService } from './clip.service';
import { ClipController } from './clip.controller';
import { Channel } from '../channel/entities/channel.entity';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Clip, Channel]),
    VideoModule, // provides HlsService
  ],
  controllers: [ClipController],
  providers: [ClipService],
  exports: [ClipService],
})
export class ClipModule {}
