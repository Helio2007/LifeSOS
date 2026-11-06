import type { Emergency } from "./emergency";

export const WS_EVENTS = {
  EMERGENCY_CREATED: "emergency.created",
  EMERGENCY_UPDATED: "emergency.updated",
} as const;

export type WsEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

export interface EmergencyCreatedEvent {
  type: "emergency.created";
  occurredAt: string;
  payload: Emergency;
}

export interface EmergencyUpdatedEvent {
  type: "emergency.updated";
  occurredAt: string;
  payload: Emergency;
}

export type LifeSosWsEvent = EmergencyCreatedEvent | EmergencyUpdatedEvent;
