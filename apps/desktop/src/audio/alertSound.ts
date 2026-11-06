let ctx: AudioContext | null = null;
let stopAlarm: (() => void) | null = null;

function audio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

/** Call from a user gesture (RFID tap / simulate) so the Flash Alert siren can start later. */
export async function unlockAudio(): Promise<void> {
  const ac = audio();
  if (ac.state === "suspended") {
    await ac.resume();
  }
}

export function stopAlertSound(): void {
  stopAlarm?.();
  stopAlarm = null;
}

/** Two-tone ER alarm. Returns a stopper; also stoppable via stopAlertSound(). */
export function playAlertSound(): () => void {
  stopAlertSound();
  const ac = audio();
  const master = ac.createGain();
  master.gain.value = 0.18;
  master.connect(ac.destination);

  const oscA = ac.createOscillator();
  const oscB = ac.createOscillator();
  const gate = ac.createGain();
  oscA.type = "square";
  oscB.type = "square";
  oscA.frequency.value = 740;
  oscB.frequency.value = 912;
  gate.gain.value = 0;
  oscA.connect(gate);
  oscB.connect(gate);
  gate.connect(master);
  oscA.start();
  oscB.start();

  let on = true;
  const tick = () => {
    const t = ac.currentTime;
    gate.gain.cancelScheduledValues(t);
    gate.gain.setValueAtTime(on ? 0.9 : 0, t);
    oscA.frequency.setValueAtTime(on ? 740 : 560, t);
    oscB.frequency.setValueAtTime(on ? 912 : 680, t);
    on = !on;
  };
  tick();
  const timer = window.setInterval(tick, 280);

  const stop = () => {
    window.clearInterval(timer);
    const t = ac.currentTime;
    gate.gain.cancelScheduledValues(t);
    gate.gain.setTargetAtTime(0, t, 0.03);
    window.setTimeout(() => {
      oscA.stop();
      oscB.stop();
      oscA.disconnect();
      oscB.disconnect();
      gate.disconnect();
      master.disconnect();
    }, 80);
    if (stopAlarm === stop) stopAlarm = null;
  };

  stopAlarm = stop;
  return stop;
}
