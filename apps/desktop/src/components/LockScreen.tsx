import { useEffect, useState } from "react";
import { useEr } from "../state/ErSession";
import { RfidCards } from "./RfidCards";

export function LockScreen() {
  const {
    emergencies,
    rfidError,
    rfidBusy,
    lastUid,
    simulateIncoming,
  } = useEr();
  const [clock, setClock] = useState(() => new Date());
  const waiting = emergencies.length;

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="lock">
      <div className="lock__panel">
        <p className="eyebrow">LifeSOS · ER Terminal</p>
        <h1>Terminal locked</h1>
        <p className="lede">
          Scan a staff RFID card to sign in. Case details stay hidden until the
          desk is unlocked.
        </p>
        <p className="lock__clock">{clock.toLocaleTimeString()}</p>
        <p className="lock__wait">
          {waiting === 0
            ? "No cases on the desk"
            : `${waiting} case${waiting === 1 ? "" : "s"} waiting — scan to view`}
        </p>
        <p className="hint">
          Keyboard wedge: UID + Enter
          {lastUid ? ` · last ${lastUid.toUpperCase()}` : ""}
          {rfidBusy ? " · verifying…" : ""}
        </p>
        {rfidError ? <p className="error">{rfidError}</p> : null}
        <RfidCards />
        <button type="button" className="btn btn--ghost lock__sim" onClick={() => void simulateIncoming()}>
          Simulate ambulance report
        </button>
      </div>
    </div>
  );
}
