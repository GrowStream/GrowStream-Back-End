import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LiveService } from './live.service';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a live stream' })
  async create(@Request() req: any, @Body() createDto: any) {
    return this.liveService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active live streams' })
  async findAll() {
    return this.liveService.findAll();
  }

  @Get('channel/:channelId')
  @ApiOperation({ summary: 'Get live streams by channel ID' })
  async findByChannelId(@Param('channelId') channelId: string) {
    return this.liveService.findByChannelId(channelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get live stream by ID' })
  async findOne(@Param('id') id: string) {
    return this.liveService.findOne(id);
  }

  @Put(':id/start')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start a live stream' })
  async start(@Param('id') id: string, @Request() req: any) {
    return this.liveService.startStream(id, req.user.id);
  }

  @Put(':id/end')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'End a live stream' })
  async end(@Param('id') id: string, @Request() req: any) {
    return this.liveService.endStream(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a live stream' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.liveService.delete(id, req.user.id);
  }
}
