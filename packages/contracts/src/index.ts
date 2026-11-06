export {
  EMERGENCY_STATUSES,
  STATUS_SEQUENCE,
  isEmergencyStatus,
  type EmergencyStatus,
  type Patient,
  type Vitals,
  type TreatmentNote,
  type Emergency,
} from "./emergency";

export {
  WS_EVENTS,
  type WsEventName,
  type EmergencyCreatedEvent,
  type EmergencyUpdatedEvent,
  type LifeSosWsEvent,
} from "./websocket";

export {
  STAFF_ROLES,
  type StaffRole,
  type RfidVerifyRequest,
  type RfidVerifyResponse,
} from "./rfid";
