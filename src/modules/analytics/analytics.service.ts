import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoView } from '../video/entities/video-view.entity';
import { Video } from '../video/entities/video.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(VideoView)
    private videoViewRepository: Repository<VideoView>,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  async getVideoAnalytics(videoId: string) {
    const views = await this.videoViewRepository.find({
      where: { videoId },
    });

    const totalViews = views.length;
    const completedViews = views.filter(v => v.completed).length;
    const averageWatchTime = views.reduce((sum, v) => sum + v.watchTime, 0) / totalViews || 0;

    return {
      totalViews,
      completedViews,
      averageWatchTime: Math.round(averageWatchTime),
      completionRate: totalViews > 0 ? Math.round((completedViews / totalViews) * 100) : 0,
    };
  }

  async getChannelAnalytics(channelId: string) {
    const videos = await this.videoRepository.find({
      where: { channelId },
    });

    const totalViews = videos.reduce((sum, v) => sum + v.viewsCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likesCount, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.commentsCount, 0);

    return {
      totalVideos: videos.length,
      totalViews,
      totalLikes,
      totalComments,
    };
  }

  async getUserAnalytics(userId: string) {
    const views = await this.videoViewRepository.find({
      where: { userId },
    });

    return {
      totalWatchTime: views.reduce((sum, v) => sum + v.watchTime, 0),
      videosWatched: views.length,
    };
  }
}

