import { 
    Channel, 
    SocketConnectOption, 
    Socket
} from 'phoenix';

export type NgAfterJoin = (channel: Channel) => void
export type NgBeforeJoin = (channel: Channel) => void
export type NgJoinChannelType = (topic: string, params?: object, beforeJoin?: NgBeforeJoin, afterJoin?: NgAfterJoin) => void

export interface INgPhoenixService {
  isConnected(): boolean;
//   constructSocket(endpoint: string, params?: any): void;
  getSocket(): Socket | null;
  setSocket(socket: Socket | null): void;
  connect(options?: Partial<SocketConnectOption>): void;
  disconnect(): void;
  joinChannel(
    topic: string,
    params?: object,
    beforeJoin?: (channel: Channel) => void,
    afterJoin?: (channel: Channel) => void,
  ): void;
  leaveChannel(topic: string): void;
}