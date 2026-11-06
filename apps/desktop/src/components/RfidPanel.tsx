import { DEMO_RFID_CARDS } from "../mock/inProcessApi";
import { useEr } from "../state/ErSession";

export function RfidPanel() {
  const { staff, rfidError, rfidBusy, lastUid, verifyRfid, clearStaff } = useEr();

  return (
    <aside className="rfid">
      <div>
        <p className="eyebrow">RFID unlock</p>
        {staff ? (
          <p className="rfid__status rfid__status--open">
            {staff.name} · {staff.role}
          </p>
        ) : (
          <p className="rfid__status">Clinical actions locked — tap a card</p>
        )}
        <p className="hint">
          Keyboard wedge: UID + Enter
          {lastUid ? ` · last ${lastUid.toUpperCase()}` : ""}
          {rfidBusy ? " · verifying…" : ""}
        </p>
        {rfidError ? <p className="error">{rfidError}</p> : null}
      </div>
      <div className="rfid__cards">
        {DEMO_RFID_CARDS.map((card) => (
          <button
            key={card.uid}
            type="button"
            className="chip"
            onClick={() => void verifyRfid(card.uid)}
          >
            {card.uid}
            <span>
              {card.name.split(" ").slice(-1)[0]} · {card.role}
            </span>
          </button>
        ))}
        {staff ? (
          <button type="button" className="chip chip--ghost" onClick={clearStaff}>
            Lock desk
          </button>
        ) : null}
      </div>
    </aside>
  );
}
