import { useEr } from "../state/ErSession";
import { RfidCards } from "./RfidCards";

export function RfidPanel() {
  const { staff, rfidError, rfidBusy, lastUid, lockDesk } = useEr();
  if (!staff) return null;

  return (
    <aside className="rfid">
      <div>
        <p className="eyebrow">RFID session</p>
        <p className="rfid__status rfid__status--open">
          {staff.name} · {staff.role}
        </p>
        <p className="hint">
          Keyboard wedge: UID + Enter
          {lastUid ? ` · last ${lastUid.toUpperCase()}` : ""}
          {rfidBusy ? " · verifying…" : ""}
        </p>
        {rfidError ? <p className="error">{rfidError}</p> : null}
      </div>
      <RfidCards
        extra={
          <button type="button" className="chip chip--ghost" onClick={lockDesk}>
            Lock desk
          </button>
        }
      />
    </aside>
  );
}
