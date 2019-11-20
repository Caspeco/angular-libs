import { NgPhoenixEventType } from './ng-phoenix-event-type.enum';

export interface NgPhoenixEvent {
  type: NgPhoenixEventType,
  topic?: string,
  reason?: string
}