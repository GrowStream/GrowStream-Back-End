import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = [
      'uploads',
      'uploads/videos',
      'uploads/thumbnails',
      'uploads/avatars',
      'uploads/channels',
      'uploads/hls',
    ];

    dirs.forEach((dir) => {
      const fullPath = join(process.cwd(), dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  getVideoPath(): string {
    return join(process.cwd(), 'uploads/videos');
  }

  getThumbnailPath(): string {
    return join(process.cwd(), 'uploads/thumbnails');
  }

  getAvatarPath(): string {
    return join(process.cwd(), 'uploads/avatars');
  }

  getChannelPath(): string {
    return join(process.cwd(), 'uploads/channels');
  }

  getHlsPath(): string {
    return join(process.cwd(), 'uploads/hls');
  }

  generateUniqueFilename(originalName: string): string {
    const ext = originalName.split('.').pop();
    return `${uuidv4()}.${ext}`;
  }

  /**
   * Validate uploaded video file
   */
  async validateVideoFile(file: Express.Multer.File): Promise<void> {
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'];
    const allowedExtensions = ['.mp4', '.webm', '.avi', '.mov'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported video format. Allowed: MP4, WebM, AVI, MOV');
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException('Unsupported file extension');
    }

    if (file.size > 1024 * 1024 * 1024) { // 1GB
      throw new BadRequestException('File too large. Max 1GB');
    }
  }

  getFileUrl(path: string): string {
    const baseUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    return `${baseUrl}/${path}`;
  }
}


