import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from './video.service';

@ApiTags('videos')
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new video' })
  async create(@Request() req: any, @Body() createVideoDto: any) {
    return this.videoService.create(req.user.id, createVideoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'channelId', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('channelId') channelId?: string,
  ) {
    return this.videoService.findAll({ page, limit, channelId });
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending videos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTrending(@Query('limit') limit?: number) {
    return this.videoService.getTrendingVideos(limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent videos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecent(@Query('limit') limit?: number) {
    return this.videoService.getRecentVideos(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async findById(@Param('id') id: string) {
    return this.videoService.findById(id);
  }

  @Get('channel/:channelId')
  @ApiOperation({ summary: 'Get videos by channel ID' })
  async findByChannelId(@Param('channelId') channelId: string) {
    return this.videoService.findByChannelId(channelId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update video' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateData: any,
  ) {
    return this.videoService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete video' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.videoService.delete(id, req.user.id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record video view' })
  async incrementViews(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.videoService.incrementViews(id, userId);
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Get video files' })
  async getVideoFiles(@Param('id') id: string) {
    return this.videoService.getVideoFiles(id);
  }
}

