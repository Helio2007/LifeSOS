export const STAFF_ROLES = [
  "PHYSICIAN",
  "NURSE",
  "PARAMEDIC",
  "ADMIN",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/** POST /api/rfid/verify request body */
export interface RfidVerifyRequest {
  uid: string;
}

/** POST /api/rfid/verify response body */
export interface RfidVerifyResponse {
  staffId: string;
  name: string;
  role: StaffRole;
  token: string;
}
