import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Add a comment' })
  async create(@Body() body: { videoId: string; text: string }, @Request() req: any) {
    return this.commentService.create(body.videoId, req.user.id, body.text);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get comments by video ID' })
  async findByVideoId(@Param('videoId') videoId: string) {
    return this.commentService.findByVideoId(videoId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update comment' })
  async update(@Param('id') id: string, @Body() body: { text: string }, @Request() req: any) {
    return this.commentService.update(id, req.user.id, body.text);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete comment' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.commentService.delete(id, req.user.id);
  }
}

