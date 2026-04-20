import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Channel } from '../channel/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Channel])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
