import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comment.service';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Post a comment (video or clip)' })
  async create(@Request() req: any, @Body() dto: any) {
    return this.commentService.create(req.user.id, dto);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get comments for a video' })
  async getByVideo(@Param('videoId') videoId: string) {
    return this.commentService.findByVideoId(videoId);
  }

  @Get('clip/:clipId')
  @ApiOperation({ summary: 'Get comments for a clip' })
  async getByClip(@Param('clipId') clipId: string) {
    return this.commentService.findByClipId(clipId);
  }

  @Get('replies/:parentId')
  @ApiOperation({ summary: 'Get replies for a comment' })
  async getReplies(@Param('parentId') parentId: string) {
    return this.commentService.findReplies(parentId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.commentService.remove(id, req.user.id);
  }
}
