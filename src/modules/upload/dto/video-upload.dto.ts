import { ApiProperty } from '@nestjs/swagger';

export class VideoUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file to upload (MP4, WebM, AVI, MOV - max 1GB)'
  })
  video: any;
}
