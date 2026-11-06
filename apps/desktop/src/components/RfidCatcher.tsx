import { useRfidWedge } from "../rfid/useRfidWedge";
import { useEr } from "../state/ErSession";

export function RfidCatcher() {
  const { verifyRfid } = useEr();
  const { inputRef } = useRfidWedge((uid) => {
    void verifyRfid(uid);
  });

  return (
    <input
      ref={inputRef}
      className="rfid-hidden"
      aria-label="RFID keyboard-wedge input"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
    />
  );
}
