import { useEffect, useState } from "react";
import { USE_MOCK } from "../api/client";
import { useRfidWedge } from "../rfid/useRfidWedge";
import { useEr } from "../state/ErSession";
import { CaseDetail } from "./CaseDetail";
import { FlashAlert } from "./FlashAlert";
import { RfidPanel } from "./RfidPanel";

export function ErShell() {
  const {
    session,
    emergencies,
    selectedId,
    selected,
    logout,
    selectCase,
    simulateIncoming,
    verifyRfid,
  } = useEr();
  const { inputRef } = useRfidWedge((uid) => {
    void verifyRfid(uid);
  });
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="shell">
      <input
        ref={inputRef}
        className="rfid-hidden"
        aria-label="RFID keyboard-wedge input"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <header className="topbar">
        <div>
          <p className="eyebrow">LifeSOS</p>
          <h1>ER Terminal</h1>
        </div>
        <div className="topbar__meta">
          <span className="clock">{clock.toLocaleTimeString()}</span>
          <span className="pill">{USE_MOCK ? "Mock API" : "Spring Boot"}</span>
          <span className="pill">{session?.displayName}</span>
          <button type="button" className="btn" onClick={() => void simulateIncoming()}>
            Simulate ambulance report
          </button>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="workspace">
        <nav className="queue" aria-label="Emergency queue">
          <p className="eyebrow">Live cases</p>
          {emergencies.length === 0 ? (
            <p className="hint waiting">Waiting for ambulance report…</p>
          ) : (
            <ul>
              {emergencies.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === selectedId ? "queue__item queue__item--active" : "queue__item"}
                    onClick={() => selectCase(item.id)}
                  >
                    <strong>{item.patient.fullName}</strong>
                    <span>
                      {item.status.replaceAll("_", " ")}
                      {item.critical ? " · CRIT" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <main>
          {selected ? (
            <CaseDetail emergency={selected} />
          ) : (
            <div className="empty">
              <span className="empty__radar" />
              <h2>Desk armed</h2>
              <p>A mock `emergency.created` event will flash this screen.</p>
            </div>
          )}
        </main>
      </div>

      <RfidPanel />
      <FlashAlert />
    </div>
  );
}
