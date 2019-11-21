import { Injectable } from '@angular/core';
import { 
  Channel, 
  Socket,
  Presence
} from 'phoenix';
import { Subject } from 'rxjs';
import { INgPhoenixService, NgAfterJoin, NgBeforeJoin } from './ng-phoenix.interface';
import { NgPhoenixStatusResponse } from './ng-phoenix-status-response.enum';
import { NgPhoenixEvent } from './ng-phoenix-event.interface';
import { NgPhoenixEventType } from './ng-phoenix-event-type.enum';
import { NgPhoenixError } from './ng-phoenix.error';

@Injectable({
  providedIn: 'root'
})
export class NgPhoenixService implements INgPhoenixService {
  private _socket: Socket = null;
  private _channels: Map<string, Channel> = new Map();
  private _presences: Map<Channel, Presence> = new Map();

  public subject: Subject<NgPhoenixEvent> = new Subject<NgPhoenixEvent>();

  constructor() { }

  public isConnected(): boolean {
    return this._socket != null && this._socket.isConnected();
  }

  public getSocket(): Socket | null { return this._socket; }
  public setSocket(socket: Socket | null) { 
    this._setupSocket(socket);
    this._socket = socket; 
  }

  public connect() {
    if (this._socket == null || this._socket.isConnected()) {
      throw new NgPhoenixError('socket-error', 'Socket is null or already connected', { 
        isSocketNull: this._socket == null, 
        isConnected: this._socket != null && this._socket.isConnected() || false
      });
    }
    this._socket.connect();
  }

  public disconnect() {
    if (this._socket === null) {
      throw new NgPhoenixError('socket-error', 'Socket is null, cannot join channel', { 
        isSocketNull: true
      });
    }
    this._socket.disconnect();
  }

  public joinChannel(topic: string, params?: object, beforeJoin?: NgBeforeJoin, afterJoin?: NgAfterJoin) {
    if (this._socket == null) {
      console.warn('Socket is null, cannot join channel - aborting!');
      throw new NgPhoenixError('socket-error', 'Socket is null, cannot join channel', { 
        isSocketNull: true, 
        topic: topic,
        params: params
      });
    }
    if (this._channels.get(topic)) {
      throw new NgPhoenixError('channel-error', 'Channel already exists', { 
        topic: topic,
        params: params
      });
    }
    const channel = this._socket.channel(topic, params);
    this._setupChannel(topic, channel);
    if (beforeJoin != null) { beforeJoin(channel) }
    this._channels = this._channels.set(topic, channel);
    channel.join()
      .receive(NgPhoenixStatusResponse.OK, _ => { 
        if (afterJoin != null) { afterJoin(channel) }
        this.subject.next({ type: NgPhoenixEventType.ChannelJoined, topic: topic });
      })
      .receive(NgPhoenixStatusResponse.ERROR, resp => {
        this.subject.next({ type: NgPhoenixEventType.ChannelError, topic: topic, reason: resp });
      })
      .receive(NgPhoenixStatusResponse.TIMEOUT, resp => {
        this.subject.next({ type: NgPhoenixEventType.ChannelError, topic: topic, reason: resp });
      })
  }

  public leaveChannel(topic: string) {
    if (!!this._channels.get(topic)) {
      this._channels.get(topic).leave();
    } else {
      throw new NgPhoenixError('channel-error', 'Channel did not exist when trying to leave', { 
        topic: topic
      });
    }
  }

  /**
   * PRIVATE
   */
  private _setupSocket = (socket: Socket) => {
    socket.onOpen(() => { this.subject.next({ type: NgPhoenixEventType.SocketUp });});
    socket.onError(() => { this.subject.next({ type: NgPhoenixEventType.SocketError });});
    socket.onClose(() => { this.subject.next({ type: NgPhoenixEventType.SocketDown });});
  }
  
  private _setupChannel(topic: string, channel: Channel) {
    console.log(`Setting up channel ${topic} with default hooks`);

    channel.onError((reason: string) => {
      console.error(`Error on channel ${topic}: ${reason}`);
      this.subject.next({ type: NgPhoenixEventType.ChannelError, topic: topic, reason: reason });
    });
    channel.onClose(() => {
      console.log(`${topic} closed`);
      this.subject.next({ type: NgPhoenixEventType.ChannelLeft, topic: topic });
    });
  }
}
