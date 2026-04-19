import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveStream } from './entities/live-stream.entity';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { Channel } from '../channel/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveStream, Channel])],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
