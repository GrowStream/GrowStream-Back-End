import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChannelService } from './channel.service';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new channel' })
  async create(@Request() req: any, @Body() createChannelDto: any) {
    return this.channelService.create(req.user.id, createChannelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all channels' })
  async findAll() {
    return this.channelService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get channel by ID' })
  async findById(@Param('id') id: string) {
    return this.channelService.findById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get channels by user ID' })
  async findByUserId(@Param('userId') userId: string) {
    return this.channelService.findByUserId(userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update channel' })
  async update(@Param('id') id: string, @Request() req: any, @Body() updateData: any) {
    return this.channelService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete channel' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.channelService.delete(id, req.user.id);
  }

  @Post(':id/subscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Subscribe to channel' })
  async subscribe(@Param('id') id: string) {
    return this.channelService.subscribe(id);
  }

  @Post(':id/unsubscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unsubscribe from channel' })
  async unsubscribe(@Param('id') id: string) {
    return this.channelService.unsubscribe(id);
  }
}

