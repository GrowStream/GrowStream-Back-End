import { Controller, Post, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LikeService } from './like.service';

@ApiTags('likes')
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':videoId/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like a video' })
  async like(@Param('videoId') videoId: string, @Request() req: any) {
    return this.likeService.likeVideo(videoId, req.user.id);
  }

  @Post(':videoId/dislike')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Dislike a video' })
  async dislike(@Param('videoId') videoId: string, @Request() req: any) {
    return this.likeService.dislikeVideo(videoId, req.user.id);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get likes for a video' })
  async getLikes(@Param('videoId') videoId: string) {
    return this.likeService.getLikesByVideoId(videoId);
  }

  @Get('video/:videoId/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user\'s like status for a video' })
  async getUserLike(@Param('videoId') videoId: string, @Request() req: any) {
    return this.likeService.getUserLike(videoId, req.user.id);
  }
}

