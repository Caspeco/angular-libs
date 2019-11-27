import { TestBed } from '@angular/core/testing';
import { 
  Channel, 
  Push, 
  Socket 
} from 'phoenix';

import { NgPhoenixService } from './ng-phoenix.service';
import { NgPhoenixStatusResponse } from './ng-phoenix-status-response.enum';

class MockSock extends Socket {
  private __isConnected: boolean;

  constructor(isConnnected: boolean) { 
    super('/mocked-socket');
    this.__isConnected = isConnnected; 
  }

  connect() { this.__isConnected = true; }
  disconnect() { this.__isConnected = false; }
  isConnected() { return this.__isConnected; }
  channel(topic: string, params?: object): Channel {
    return new MockChannel(topic, params);
  }
}

class MockChannel extends Channel {
  private __hasJoined: boolean;
  private __params: object;

  constructor(topic: string, params?: object) { 
    super(topic, params);
    this.__params = params || {};
  }

  join(timeout?: number): Push {
    return new Push(this, "phx_join", this.__params, timeout);
  }
}

describe('NgPhoenixService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('can set socket to null', () => {
    const service: NgPhoenixService = TestBed.get(NgPhoenixService);
    expect(service).toBeTruthy();
    service.setSocket(null);
    expect(service.getSocket()).toBeNull();
  });

  it('can set socket to a socket', () => {
    const service: NgPhoenixService = TestBed.get(NgPhoenixService);
    expect(service).toBeTruthy();
    const socket = new Socket('/socket');
    service.setSocket(socket);
    expect(service.getSocket()).toEqual(socket);
  });

  it('can connect and disconnect', () => {
    const service: NgPhoenixService = TestBed.get(NgPhoenixService);
    expect(service).toBeTruthy();
    service.setSocket(new MockSock(false));
    service.connect();
    expect(service.isConnected()).toEqual(true);
    service.disconnect();
    expect(service.isConnected()).toEqual(false);
  });

  it('cannot connect when socket is null', () => {
    const service: NgPhoenixService = TestBed.get(NgPhoenixService);
    expect(service).toBeTruthy();
    service.setSocket(null);
    expect(() => { service.connect() }).toThrowError('socket is null');
    expect(service.isConnected()).toEqual(false);
  });
});
