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
  public subject: Subject<NgPhoenixEvent> = new Subject<NgPhoenixEvent>();

  private _socket: Socket = null;
  private _channels: Map<string, Channel> = new Map();

  constructor() { }

  public isConnected(): boolean {
    return this._socket != null && this._socket.isConnected();
  }

  public getSocket(): Socket | null { return this._socket; }
  public setSocket(socket: Socket | null) {
    this.setupSocket(socket);
    this._socket = socket;
  }

  public connect() {
    if (this._socket == null) {
      throw new NgPhoenixError('socket-error', 'socket is null');
    }
    if (this._socket.isConnected()) {
      throw new NgPhoenixError('socket-error', 'already connected');
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
        topic,
        params
      });
    }
    if (this._channels.get(topic)) {
      throw new NgPhoenixError('channel-error', 'Channel already exists', {
        topic,
        params
      });
    }
    const channel = this._socket.channel(topic, params);
    this.setupChannel(topic, channel);
    if (beforeJoin != null) { beforeJoin(channel); }
    this._channels = this._channels.set(topic, channel);
    channel.join()
      .receive(NgPhoenixStatusResponse.OK, _ => {
        if (afterJoin != null) { afterJoin(channel); }
        this.subject.next({ type: NgPhoenixEventType.ChannelJoined, topic });
      })
      .receive(NgPhoenixStatusResponse.ERROR, resp => {
        this.subject.next({ type: NgPhoenixEventType.ChannelError, topic, reason: resp });
      })
      .receive(NgPhoenixStatusResponse.TIMEOUT, resp => {
        this.subject.next({ type: NgPhoenixEventType.ChannelError, topic, reason: resp });
      });
  }

  public leaveChannel(topic: string) {
    if (!!this._channels.get(topic)) {
      this._channels.get(topic).leave();
      this._channels.delete(topic);
    } else {
      throw new NgPhoenixError('channel-error', 'Channel did not exist when trying to leave', {
        topic
      });
    }
  }

  /**
   * PRIVATE
   */
  private setupSocket = (socket: Socket) => {
    if (socket == null) { return; }

    socket.onOpen(() => { this.subject.next({ type: NgPhoenixEventType.SocketUp }); });
    socket.onError(() => { this.subject.next({ type: NgPhoenixEventType.SocketError }); });
    socket.onClose(() => { this.subject.next({ type: NgPhoenixEventType.SocketDown }); });
  }

  private setupChannel = (topic: string, channel: Channel) => {
    channel.onError((reason: string) => {
      console.error(`Error on channel ${topic}: ${reason}`);
      this.subject.next({ type: NgPhoenixEventType.ChannelError, topic, reason });
    });
    channel.onClose(() => {
      console.log(`${topic} closed`);
      this._channels.delete(topic);
      this.subject.next({ type: NgPhoenixEventType.ChannelLeft, topic });
    });
  }
}
