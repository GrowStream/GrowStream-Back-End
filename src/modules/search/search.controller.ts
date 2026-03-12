import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search videos and channels' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['video', 'channel', 'all'] })
  async search(
    @Query('q') query: string,
    @Query('type') type: 'video' | 'channel' | 'all' = 'all',
  ) {
    if (type === 'video') {
      return this.searchService.searchVideos(query);
    }
    if (type === 'channel') {
      return this.searchService.searchChannels(query);
    }
    return this.searchService.searchAll(query);
  }

  @Get('videos')
  @ApiOperation({ summary: 'Search videos only' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async searchVideos(@Query('q') query: string) {
    return this.searchService.searchVideos(query);
  }

  @Get('channels')
  @ApiOperation({ summary: 'Search channels only' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async searchChannels(@Query('q') query: string) {
    return this.searchService.searchChannels(query);
  }
}

