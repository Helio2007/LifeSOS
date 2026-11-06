import { useEffect, useRef, type RefObject } from "react";

const BURST_GAP_MS = 75;
const MIN_UID_LENGTH = 4;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

/**
 * USB RFID readers in keyboard-wedge mode type the UID then Enter.
 * Fast bursts are treated as a card even if a form field is focused.
 * Slow typing into a real field is ignored (except the hidden RFID input).
 */
export function useRfidWedge(onUid: (uid: string) => void): {
  inputRef: RefObject<HTMLInputElement>;
} {
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef("");
  const lastKeyAt = useRef(0);
  const onUidRef = useRef(onUid);
  onUidRef.current = onUid;

  useEffect(() => {
    const flush = () => {
      const uid = bufferRef.current.trim();
      bufferRef.current = "";
      if (uid.length >= MIN_UID_LENGTH) {
        if (inputRef.current) inputRef.current.value = "";
        onUidRef.current(uid);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const hidden = inputRef.current;
      const fromHidden = hidden !== null && event.target === hidden;
      const typing = isTypingTarget(event.target) && !fromHidden;
      const now = Date.now();
      const gap = now - lastKeyAt.current;
      lastKeyAt.current = now;
      const burst = gap > 0 && gap < BURST_GAP_MS && bufferRef.current.length > 0;

      if (event.key === "Enter") {
        if (fromHidden || burst || !typing) {
          if (bufferRef.current.length >= MIN_UID_LENGTH) {
            event.preventDefault();
            event.stopPropagation();
            flush();
          } else {
            bufferRef.current = "";
          }
        }
        return;
      }

      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (fromHidden || burst || !typing) {
        if (!burst && !fromHidden) {
          bufferRef.current = "";
        }
        bufferRef.current += event.key;
        if (burst && typing) {
          event.preventDefault();
        }
      } else {
        bufferRef.current = "";
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  useEffect(() => {
    const keepFocus = () => {
      const hidden = inputRef.current;
      if (!hidden) return;
      if (isTypingTarget(document.activeElement) && document.activeElement !== hidden) {
        return;
      }
      hidden.focus({ preventScroll: true });
    };
    const timer = window.setInterval(keepFocus, 1200);
    window.addEventListener("pointerdown", keepFocus);
    keepFocus();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", keepFocus);
    };
  }, []);

  return { inputRef };
}
