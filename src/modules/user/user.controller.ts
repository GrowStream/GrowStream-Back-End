import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateProfileDto } from '../auth/dto/auth.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.userService.findById(req.user.id);
  }

  @Get('me/content')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get authenticated user channel content' })
  @ApiQuery({ name: 'type', required: false, enum: ['videos', 'clips'], description: 'Content type' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getContent(
    @Request() req: any,
    @Query('type') type: 'videos' | 'clips' = 'videos',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.getContent(req.user.id, type, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req: any, @Body() updateDto: UpdateProfileDto) {
    return this.userService.update(req.user.id, updateDto);
  }

  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteAccount(@Request() req: any) {
    return this.userService.delete(req.user.id);
  }
}
