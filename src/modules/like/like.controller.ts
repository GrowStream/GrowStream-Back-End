import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LikeService } from './like.service';

@ApiTags('likes')
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  // Video Likes
  @Post(':videoId/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like a video' })
  async likeVideo(@Param('videoId') videoId: string, @Request() req: any) {
    return this.likeService.likeVideo(videoId, req.user.id);
  }

  @Post(':videoId/dislike')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Dislike a video' })
  async dislikeVideo(@Param('videoId') videoId: string, @Request() req: any) {
    return this.likeService.dislikeVideo(videoId, req.user.id);
  }

  @Get('video/:videoId/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user\'s like status for a video' })
  async getUserVideoLike(@Param('videoId') videoId: string, @Request() req: any) {
    return this.likeService.getUserLike(videoId, req.user.id);
  }

  // Clip Likes
  @Post('clip/:clipId/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like a clip' })
  async likeClip(@Param('clipId') clipId: string, @Request() req: any) {
    return this.likeService.likeClip(clipId, req.user.id);
  }

  @Post('clip/:clipId/dislike')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Dislike a clip' })
  async dislikeClip(@Param('clipId') clipId: string, @Request() req: any) {
    return this.likeService.dislikeClip(clipId, req.user.id);
  }

  @Get('clip/:clipId/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user\'s like status for a clip' })
  async getUserClipLike(@Param('clipId') clipId: string, @Request() req: any) {
    return this.likeService.getUserClipLike(clipId, req.user.id);
  }
}
