import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentLike, Video, Clip])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
