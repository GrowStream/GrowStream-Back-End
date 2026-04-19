import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PostService } from './post.service';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a community post' })
  async create(@Request() req: any, @Body() createDto: any) {
    return this.postService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({ name: 'channelId', required: false, type: String })
  async findAll(@Query('channelId') channelId?: string) {
    return this.postService.findAll(channelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a post' })
  async update(@Param('id') id: string, @Request() req: any, @Body() updateData: any) {
    return this.postService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a post' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.postService.delete(id, req.user.id);
  }
}
