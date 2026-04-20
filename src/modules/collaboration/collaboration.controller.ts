import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CollaborationService } from './collaboration.service';

@ApiTags('collaborations')
@Controller('collaborations')
export class CollaborationController {
  constructor(private readonly collabService: CollaborationService) {}

  @Post(':targetChannelId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send a collaboration request' })
  async createRequest(
    @Param('targetChannelId') targetChannelId: string,
    @Request() req: any,
    @Body() dto: any
  ) {
    return this.collabService.createRequest(req.user.id, targetChannelId, dto);
  }

  @Get('channel/:channelId')
  @ApiOperation({ summary: 'Get all collaborations for a channel' })
  async findAll(@Param('channelId') channelId: string) {
    return this.collabService.findAllForChannel(channelId);
  }

  @Put(':id/:status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update collaboration status' })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'active' | 'completed' | 'cancelled',
    @Request() req: any
  ) {
    return this.collabService.updateStatus(id, req.user.id, status);
  }
}
