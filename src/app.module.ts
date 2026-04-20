import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChannelModule } from './modules/channel/channel.module';
import { VideoModule } from './modules/video/video.module';
import { UploadModule } from './modules/upload/upload.module';
import { CommentModule } from './modules/comment/comment.module';
import { LikeModule } from './modules/like/like.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SearchModule } from './modules/search/search.module';
import { GatewayModule } from './gateway/gateway.module';
import { ClipModule } from './modules/clip/clip.module';
import { LiveModule } from './modules/live/live.module';
import { PostModule } from './modules/post/post.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { staticConfig } from './config/static.config';

@Module({
  imports: [
    // Static files
    ServeStaticModule.forRootAsync({
      useFactory: () => staticConfig,
    }),
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'glow_stream'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Application Modules
    AuthModule,
    UserModule,
    ChannelModule,
    VideoModule,
    UploadModule,
    CommentModule,
    LikeModule,
    AnalyticsModule,
    NotificationModule,
    SearchModule,
    GatewayModule,
    ClipModule,
    LiveModule,
    PostModule,
    CollaborationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
