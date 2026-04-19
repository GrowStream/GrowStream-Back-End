import {
  Controller, Get, Post, Delete, Param, Body,
  Query, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClipService } from './clip.service';

@ApiTags('clips')
@Controller('clips')
export class ClipController {
  constructor(private readonly clipService: ClipService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a clip' })
  async create(@Request() req: any, @Body() createDto: any) {
    return this.clipService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ready clips (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'channelId', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('channelId') channelId?: string,
  ) {
    return this.clipService.findAll({ page, limit, channelId });
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending clips' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTrending(@Query('limit') limit?: number) {
    return this.clipService.getTrending(limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent clips' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecent(@Query('limit') limit?: number) {
    return this.clipService.getRecent(limit);
  }

  @Get('channel/:channelId')
  @ApiOperation({ summary: 'Get clips by channel ID' })
  async findByChannelId(@Param('channelId') channelId: string) {
    return this.clipService.findByChannelId(channelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get clip by ID' })
  async findById(@Param('id') id: string) {
    return this.clipService.findById(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment clip view count' })
  async incrementViews(@Param('id') id: string) {
    await this.clipService.incrementViews(id);
    return { message: 'View recorded' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a clip' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.clipService.delete(id, req.user.id);
  }
}
