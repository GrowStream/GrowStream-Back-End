import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Video } from '../video/entities/video.entity';
import { Clip } from '../clip/clip.entity';
import { Channel } from '../channel/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Video, Clip, Channel])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
