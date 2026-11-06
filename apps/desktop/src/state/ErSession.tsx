import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Emergency,
  EmergencyStatus,
  RfidVerifyResponse,
} from "@lifesos/contracts";
import { WS_EVENTS } from "@lifesos/contracts";
import { api } from "../api/client";
import { ApiError } from "../mock/inProcessApi";
import { playAlertSound, stopAlertSound, unlockAudio } from "../audio/alertSound";

interface ErContextValue {
  staff: RfidVerifyResponse | null;
  locked: boolean;
  emergencies: Emergency[];
  selectedId: string | null;
  pendingAlert: Emergency | null;
  rfidError: string | null;
  rfidBusy: boolean;
  lastUid: string | null;
  busy: boolean;
  selected: Emergency | null;
  verifyRfid: (uid: string) => Promise<void>;
  lockDesk: () => void;
  selectCase: (id: string) => void;
  ackAlert: () => void;
  updateStatus: (status: EmergencyStatus) => Promise<void>;
  addNote: (text: string) => Promise<void>;
  simulateIncoming: () => Promise<void>;
}

const ErContext = createContext<ErContextValue | null>(null);

export function ErProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<RfidVerifyResponse | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingAlert, setPendingAlert] = useState<Emergency | null>(null);
  const [rfidError, setRfidError] = useState<string | null>(null);
  const [rfidBusy, setRfidBusy] = useState(false);
  const [lastUid, setLastUid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const upsert = useCallback((incoming: Emergency) => {
    setEmergencies((prev) => {
      const without = prev.filter((item) => item.id !== incoming.id);
      return [incoming, ...without].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    });
  }, []);

  useEffect(() => {
    const unsubscribe = api.subscribe((event) => {
      upsert(event.payload);
      if (event.type === WS_EVENTS.EMERGENCY_CREATED) {
        setPendingAlert(event.payload);
        setSelectedId(event.payload.id);
        playAlertSound();
      }
    });
    void api.listEmergencies().then((list) => {
      setEmergencies(list);
    });
    const timer = window.setTimeout(() => {
      void api.simulateAmbulanceReport();
    }, 2800);
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [upsert]);

  const verifyRfid = useCallback(async (uid: string) => {
    setLastUid(uid);
    setRfidBusy(true);
    setRfidError(null);
    try {
      await unlockAudio();
      const next = await api.verifyRfid({ uid });
      setStaff(next);
    } catch (error) {
      setStaff(null);
      const message = error instanceof ApiError ? error.message : "RFID verify failed";
      setRfidError(message);
    } finally {
      setRfidBusy(false);
    }
  }, []);

  const lockDesk = useCallback(() => {
    stopAlertSound();
    setStaff(null);
    setRfidError(null);
  }, []);

  const selectCase = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const ackAlert = useCallback(() => {
    stopAlertSound();
    setPendingAlert(null);
  }, []);

  const requireStaff = useCallback(() => {
    if (!staff) {
      throw new ApiError(403, "Scan an RFID card to unlock the terminal");
    }
    return staff;
  }, [staff]);

  const updateStatus = useCallback(
    async (status: EmergencyStatus) => {
      if (!selectedId) return;
      const actor = requireStaff();
      setBusy(true);
      try {
        const updated = await api.updateStatus(selectedId, status, actor);
        upsert(updated);
      } finally {
        setBusy(false);
      }
    },
    [requireStaff, selectedId, upsert],
  );

  const addNote = useCallback(
    async (text: string) => {
      if (!selectedId) return;
      const actor = requireStaff();
      setBusy(true);
      try {
        const updated = await api.addNote(selectedId, text, actor);
        upsert(updated);
      } finally {
        setBusy(false);
      }
    },
    [requireStaff, selectedId, upsert],
  );

  const simulateIncoming = useCallback(async () => {
    await unlockAudio();
    await api.simulateAmbulanceReport();
  }, []);

  const selected = useMemo(
    () => emergencies.find((item) => item.id === selectedId) ?? null,
    [emergencies, selectedId],
  );

  const value = useMemo<ErContextValue>(
    () => ({
      staff,
      locked: !staff,
      emergencies,
      selectedId,
      pendingAlert,
      rfidError,
      rfidBusy,
      lastUid,
      busy,
      selected,
      verifyRfid,
      lockDesk,
      selectCase,
      ackAlert,
      updateStatus,
      addNote,
      simulateIncoming,
    }),
    [
      staff,
      emergencies,
      selectedId,
      pendingAlert,
      rfidError,
      rfidBusy,
      lastUid,
      busy,
      selected,
      verifyRfid,
      lockDesk,
      selectCase,
      ackAlert,
      updateStatus,
      addNote,
      simulateIncoming,
    ],
  );

  return <ErContext.Provider value={value}>{children}</ErContext.Provider>;
}

export function useEr(): ErContextValue {
  const value = useContext(ErContext);
  if (!value) {
    throw new Error("useEr must be used inside ErProvider");
  }
  return value;
}
