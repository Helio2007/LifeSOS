import type { ReactNode } from "react";
import { DEMO_RFID_CARDS } from "../mock/inProcessApi";
import { useEr } from "../state/ErSession";

export function RfidCards({ extra }: { extra?: ReactNode }) {
  const { verifyRfid } = useEr();

  return (
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
      {extra}
    </div>
  );
}
