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
      console.warn('Socket is null or already connected - aborting!');
      return;
    }
    this._socket.connect();
  }

  public disconnect() {
    if (this._socket === null) {
      console.warn('No socket to disconnect - aborting!');
      return;
    }
    this._socket.disconnect();
  }

  public joinChannel(topic: string, params?: object, beforeJoin?: NgBeforeJoin, afterJoin?: NgAfterJoin) {
    if (this._socket == null) {
      console.warn('Socket is null, cannot join channel - aborting!');
      return;
    }
    if (this._channels.get(topic)) {
      console.warn('Channel already exists - aborting!');
      return;
    }
    const channel = this._socket.channel(topic, params);
    this._setupChannel(topic, channel);
    if (beforeJoin != null) { beforeJoin(channel) }
    this._channels = this._channels.set(topic, channel);
    channel.join()
      .receive(NgPhoenixStatusResponse.OK, resp => {
        if (afterJoin != null) { afterJoin(channel) }
      })
      .receive(NgPhoenixStatusResponse.ERROR, resp => { console.error(`Failed to join channel ${topic}: ERROR`, resp); })
      .receive(NgPhoenixStatusResponse.TIMEOUT, resp => { console.error(`Failed to join channel ${topic}: TIMEOUT`, resp); })
  }

  public leaveChannel(topic: string) {
    if (!!this._channels.get(topic)) {
      this._channels.get(topic).leave();
    } else {
      console.warn(`Channel with topic ${topic} did not exist`);
    }
  }

  /**
   * PRIVATE
   */
  private _setupSocket = (socket: Socket) => {
    socket.onOpen(() => { this.subject.next(<NgPhoenixEvent> { type: NgPhoenixEventType.SocketUp }); });
    socket.onError(() => { this.subject.next(<NgPhoenixEvent> { type: NgPhoenixEventType.SocketError }); });
    socket.onClose(() => { this.subject.next(<NgPhoenixEvent> { type: NgPhoenixEventType.SocketDown }); });
  }
  
  private _setupChannel(topic: string, channel: Channel) {
    console.log(`Setting up channel ${topic} with default hooks`);

    channel.onError((reason: string) => {
      console.error(`Error on channel ${topic}: ${reason}`);
      this.subject.next(<NgPhoenixEvent> { type: NgPhoenixEventType.ChannelError, topic: topic, reason: reason });
    });
    channel.onClose(() => {
      console.log(`${topic} closed`);
      this.subject.next(<NgPhoenixEvent> { type: NgPhoenixEventType.ChannelLeft, topic: topic });
    });
  }
}
