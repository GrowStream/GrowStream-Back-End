import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideoFile } from './entities/video-file.entity';
import { VideoView } from './entities/video-view.entity';
import { VideoTag } from './entities/video-tag.entity';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, VideoFile, VideoView, VideoTag]),
    forwardRef(() => ChannelModule),
  ],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}

