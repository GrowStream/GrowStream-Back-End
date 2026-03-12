import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Req } from '@nestjs/common';
import { VideoUploadDto } from './dto/video-upload.dto';
import { UploadService } from './upload.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('video')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload video file' })
@ApiConsumes('multipart/form-data')
  @ApiBody({ type: VideoUploadDto })
    @UseInterceptors(
      FileInterceptor('video', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/videos'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {   
     if (!file) {
         throw new BadRequestException('No video file uploaded');    
     }
     if (!file.mimetype.startsWith('video/')) {
            throw new BadRequestException('Only video files are allowed (video/*)');
       }
       await this.uploadService.validateVideoFile(file);
       
      return {
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: this.uploadService.getFileUrl(`uploads/videos/${file.filename}`),
    };
  }

  @Post('thumbnail')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload video thumbnail' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/thumbnails'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: this.uploadService.getFileUrl(`uploads/thumbnails/${file.filename}`),
    };
  }

  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/avatars'),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: this.uploadService.getFileUrl(`uploads/avatars/${file.filename}`),
    };
  }

  @Post('channel/banner')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload channel banner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/channels'),
        filename: (req, file, cb) => {
          const uniqueName = `banner_${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
    }),
  )
  async uploadChannelBanner(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: this.uploadService.getFileUrl(`uploads/channels/${file.filename}`),
    };
  }

  @Post('channel/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload channel avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/channels'),
        filename: (req, file, cb) => {
          const uniqueName = `avatar_${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
    }),
  )
  async uploadChannelAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: this.uploadService.getFileUrl(`uploads/channels/${file.filename}`),
    };
  }
}

