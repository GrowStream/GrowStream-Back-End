import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-video-room')
  handleJoinVideoRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string },
  ) {
    client.join(`video-${data.videoId}`);
    this.logger.log(`Client ${client.id} joined video room: ${data.videoId}`);
    return { event: 'joined', room: `video-${data.videoId}` };
  }

  @SubscribeMessage('leave-video-room')
  handleLeaveVideoRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string },
  ) {
    client.leave(`video-${data.videoId}`);
    this.logger.log(`Client ${client.id} left video room: ${data.videoId}`);
    return { event: 'left', room: `video-${data.videoId}` };
  }

  @SubscribeMessage('new-comment')
  handleNewComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string; comment: any },
  ) {
    // Broadcast to all clients in the video room
    this.server.to(`video-${data.videoId}`).emit('comment-added', data.comment);
    return { event: 'comment-broadcast' };
  }

  @SubscribeMessage('new-like')
  handleNewLike(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string; like: any },
  ) {
    this.server.to(`video-${data.videoId}`).emit('like-updated', data.like);
    return { event: 'like-broadcast' };
  }

  @SubscribeMessage('video-view')
  handleVideoView(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { videoId: string; viewerCount: number },
  ) {
    this.server.to(`video-${data.videoId}`).emit('viewer-count', {
      videoId: data.videoId,
      count: data.viewerCount,
    });
  }

  // Method to emit notifications to specific users
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user-${userId}`).emit(event, data);
  }

  // Method to broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}

