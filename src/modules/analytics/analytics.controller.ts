import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get video analytics' })
  async getVideoAnalytics(@Param('videoId') videoId: string) {
    return this.analyticsService.getVideoAnalytics(videoId);
  }

  @Get('channel/:channelId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get channel analytics' })
  async getChannelAnalytics(@Param('channelId') channelId: string) {
    return this.analyticsService.getChannelAnalytics(channelId);
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user watch history analytics' })
  async getUserAnalytics(@Request() req: any) {
    return this.analyticsService.getUserAnalytics(req.user.id);
  }
}

