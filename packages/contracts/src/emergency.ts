export const EMERGENCY_STATUSES = [
  "CREATED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_TREATMENT",
  "COMPLETED",
] as const;

export type EmergencyStatus = (typeof EMERGENCY_STATUSES)[number];

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  sex: "M" | "F" | "X";
}

export interface Vitals {
  heartRateBpm: number;
  systolicMmhg: number;
  diastolicMmhg: number;
  spo2Percent: number;
  respiratoryRate: number;
  temperatureC: number;
  recordedAt: string;
}

export interface TreatmentNote {
  id: string;
  text: string;
  authorStaffId: string;
  authorName: string;
  createdAt: string;
}

export interface Emergency {
  id: string;
  status: EmergencyStatus;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  symptoms: string[];
  vitals: Vitals;
  notes: TreatmentNote[];
  ambulanceId?: string;
  critical?: boolean;
}

export function isEmergencyStatus(value: string): value is EmergencyStatus {
  return (EMERGENCY_STATUSES as readonly string[]).includes(value);
}

export const STATUS_SEQUENCE: EmergencyStatus[] = [
  "CREATED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_TREATMENT",
  "COMPLETED",
];
