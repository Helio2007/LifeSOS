import {
  STATUS_SEQUENCE,
  WS_EVENTS,
  isEmergencyStatus,
  type Emergency,
  type EmergencyStatus,
  type LifeSosWsEvent,
  type RfidVerifyRequest,
  type RfidVerifyResponse,
  type TreatmentNote,
} from "@lifesos/contracts";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  sessionToken: string;
  displayName: string;
  username: string;
}

type WsListener = (event: LifeSosWsEvent) => void;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_CARDS: Record<string, Omit<RfidVerifyResponse, "token">> = {
  "04A1B2C3": {
    staffId: "staff-elira",
    name: "Dr. Elira Hoxha",
    role: "PHYSICIAN",
  },
  "04D4E5F6": {
    staffId: "staff-arben",
    name: "Arben Leka",
    role: "NURSE",
  },
};

const DEMO_LOGIN = { username: "er.staff", password: "lifesos" };

const CASE_TEMPLATES: Array<Omit<Emergency, "id" | "createdAt" | "updatedAt" | "notes">> = [
  {
    status: "CREATED",
    ambulanceId: "AMB-12",
    critical: true,
    patient: {
      id: "pat-besnik",
      fullName: "Besnik Krasniqi",
      age: 54,
      sex: "M",
    },
    symptoms: ["Chest pain", "Shortness of breath", "Diaphoresis"],
    vitals: {
      heartRateBpm: 118,
      systolicMmhg: 90,
      diastolicMmhg: 60,
      spo2Percent: 91,
      respiratoryRate: 24,
      temperatureC: 36.8,
      recordedAt: new Date().toISOString(),
    },
  },
  {
    status: "EN_ROUTE",
    ambulanceId: "AMB-07",
    critical: false,
    patient: {
      id: "pat-lira",
      fullName: "Lira Berisha",
      age: 27,
      sex: "F",
    },
    symptoms: ["Closed forearm fracture", "Pain 8/10", "Nausea"],
    vitals: {
      heartRateBpm: 96,
      systolicMmhg: 128,
      diastolicMmhg: 78,
      spo2Percent: 98,
      respiratoryRate: 18,
      temperatureC: 36.6,
      recordedAt: new Date().toISOString(),
    },
  },
];

function nowIso() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

class InProcessApi {
  private emergencies = new Map<string, Emergency>();
  private listeners = new Set<WsListener>();
  private seq = 1;
  private templateIndex = 0;

  subscribe(listener: WsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async login(body: LoginRequest): Promise<LoginResponse> {
    await wait(180);
    if (
      body.username !== DEMO_LOGIN.username ||
      body.password !== DEMO_LOGIN.password
    ) {
      throw new ApiError(401, "Unknown staff login");
    }
    return {
      sessionToken: "mock-session-er-staff",
      displayName: "ER Desk",
      username: body.username,
    };
  }

  async verifyRfid(body: RfidVerifyRequest): Promise<RfidVerifyResponse> {
    await wait(120);
    const uid = body.uid.trim().toUpperCase();
    const staff = DEMO_CARDS[uid];
    if (!staff) {
      throw new ApiError(401, `Unknown RFID UID ${uid || "(empty)"}`);
    }
    return {
      ...staff,
      token: `mock-rfid-${staff.staffId}-${Date.now()}`,
    };
  }

  async listEmergencies(): Promise<Emergency[]> {
    await wait(80);
    return [...this.emergencies.values()]
      .map(clone)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateStatus(
    id: string,
    status: EmergencyStatus,
    actor: { staffId: string; name: string },
  ): Promise<Emergency> {
    await wait(140);
    const current = this.requireCase(id);
    if (!isEmergencyStatus(status)) {
      throw new ApiError(400, `Invalid status ${status}`);
    }
    const from = STATUS_SEQUENCE.indexOf(current.status);
    const to = STATUS_SEQUENCE.indexOf(status);
    if (to < from) {
      throw new ApiError(409, "Cannot move a case backwards in MVP");
    }
    current.status = status;
    current.updatedAt = nowIso();
    if (status === "IN_TREATMENT" && current.notes.length === 0) {
      current.notes.push(this.note("Treatment started at ER desk.", actor));
    }
    this.emit({
      type: WS_EVENTS.EMERGENCY_UPDATED,
      occurredAt: current.updatedAt,
      payload: clone(current),
    });
    return clone(current);
  }

  async addNote(
    id: string,
    text: string,
    actor: { staffId: string; name: string },
  ): Promise<Emergency> {
    await wait(140);
    const current = this.requireCase(id);
    const trimmed = text.trim();
    if (!trimmed) {
      throw new ApiError(400, "Note text is required");
    }
    current.notes.push(this.note(trimmed, actor));
    current.updatedAt = nowIso();
    if (current.status === "ARRIVED" || current.status === "CREATED" || current.status === "EN_ROUTE") {
      current.status = "IN_TREATMENT";
    }
    this.emit({
      type: WS_EVENTS.EMERGENCY_UPDATED,
      occurredAt: current.updatedAt,
      payload: clone(current),
    });
    return clone(current);
  }

  /** Demo helper: paramedic-side create, then push emergency.created */
  async simulateAmbulanceReport(): Promise<Emergency> {
    await wait(200);
    const template = CASE_TEMPLATES[this.templateIndex % CASE_TEMPLATES.length];
    this.templateIndex += 1;
    const createdAt = nowIso();
    const emergency: Emergency = {
      ...clone(template),
      id: `emg-${String(this.seq++).padStart(3, "0")}`,
      createdAt,
      updatedAt: createdAt,
      notes: [],
      vitals: {
        ...template.vitals,
        recordedAt: createdAt,
      },
    };
    this.emergencies.set(emergency.id, emergency);
    this.emit({
      type: WS_EVENTS.EMERGENCY_CREATED,
      occurredAt: createdAt,
      payload: clone(emergency),
    });
    return clone(emergency);
  }

  demoCards(): Array<{ uid: string; name: string; role: string }> {
    return Object.entries(DEMO_CARDS).map(([uid, staff]) => ({
      uid,
      name: staff.name,
      role: staff.role,
    }));
  }

  private requireCase(id: string): Emergency {
    const found = this.emergencies.get(id);
    if (!found) {
      throw new ApiError(404, `Emergency ${id} not found`);
    }
    return found;
  }

  private note(
    text: string,
    actor: { staffId: string; name: string },
  ): TreatmentNote {
    return {
      id: `note-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      text,
      authorStaffId: actor.staffId,
      authorName: actor.name,
      createdAt: nowIso(),
    };
  }

  private emit(event: LifeSosWsEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const mockApi = new InProcessApi();
export const DEMO_RFID_CARDS = mockApi.demoCards();
