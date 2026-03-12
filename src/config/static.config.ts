import { ServeStaticModuleOptions } from '@nestjs/serve-static';
import { join } from 'path';

export const staticConfig: ServeStaticModuleOptions[] = [
  {
    serveRoot: '/uploads',
    rootPath: join(process.cwd(), 'uploads'),
    serveStaticOptions: {
      setHeaders: (res, path) => {
        // Set appropriate headers for video files
        if (path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.m3u8')) {
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
      },
    },
  },
];

