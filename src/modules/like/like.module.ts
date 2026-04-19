import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Video, Clip])],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
