import { useState, type FormEvent } from "react";
import { STATUS_SEQUENCE, type Emergency, type EmergencyStatus, type Vitals } from "@lifesos/contracts";
import { useEr } from "../state/ErSession";

function vitalTone(key: keyof Vitals, value: number): "ok" | "warn" | "bad" {
  if (key === "heartRateBpm") {
    if (value < 50 || value > 110) return "bad";
    if (value < 60 || value > 100) return "warn";
  }
  if (key === "spo2Percent") {
    if (value < 92) return "bad";
    if (value < 95) return "warn";
  }
  if (key === "systolicMmhg") {
    if (value < 95 || value > 160) return "bad";
    if (value < 100 || value > 140) return "warn";
  }
  if (key === "respiratoryRate") {
    if (value < 10 || value > 24) return "bad";
    if (value > 20) return "warn";
  }
  return "ok";
}

export function CaseDetail({ emergency }: { emergency: Emergency }) {
  const { staff, addNote, updateStatus, busy } = useEr();
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const locked = !staff;

  const onNote = (event: FormEvent) => {
    event.preventDefault();
    setActionError(null);
    void addNote(note)
      .then(() => setNote(""))
      .catch((error: unknown) => {
        setActionError(error instanceof Error ? error.message : "Could not save note");
      });
  };

  const onStatus = (status: EmergencyStatus) => {
    setActionError(null);
    void updateStatus(status).catch((error: unknown) => {
      setActionError(error instanceof Error ? error.message : "Could not update status");
    });
  };

  const { patient, vitals } = emergency;

  return (
    <section className="case">
      <header className="case__head">
        <div>
          <p className="eyebrow">{emergency.id}</p>
          <h2>{patient.fullName}</h2>
          <p className="lede">
            {patient.age} years · {patient.sex}
            {emergency.ambulanceId ? ` · ${emergency.ambulanceId}` : ""}
            {emergency.critical ? " · critical" : ""}
          </p>
        </div>
        <span className={`status-pill status-pill--${emergency.status.toLowerCase()}`}>
          {emergency.status.replaceAll("_", " ")}
        </span>
      </header>

      <div className="case__grid">
        <article className="panel">
          <h3>Symptoms</h3>
          <ul className="tags">
            {emergency.symptoms.map((symptom) => (
              <li key={symptom}>{symptom}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h3>Vitals</h3>
          <div className="vitals">
            <Vital label="HR" unit="bpm" value={vitals.heartRateBpm} tone={vitalTone("heartRateBpm", vitals.heartRateBpm)} />
            <Vital
              label="BP"
              unit="mmHg"
              value={`${vitals.systolicMmhg}/${vitals.diastolicMmhg}`}
              tone={vitalTone("systolicMmhg", vitals.systolicMmhg)}
            />
            <Vital label="SpO2" unit="%" value={vitals.spo2Percent} tone={vitalTone("spo2Percent", vitals.spo2Percent)} />
            <Vital
              label="RR"
              unit="/min"
              value={vitals.respiratoryRate}
              tone={vitalTone("respiratoryRate", vitals.respiratoryRate)}
            />
            <Vital label="Temp" unit="°C" value={vitals.temperatureC.toFixed(1)} tone="ok" />
          </div>
          <p className="hint">Recorded {new Date(vitals.recordedAt).toLocaleTimeString()}</p>
        </article>
      </div>

      <article className="panel">
        <h3>Status</h3>
        <div className="status-row">
          {STATUS_SEQUENCE.map((status) => (
            <button
              key={status}
              type="button"
              className={
                status === emergency.status
                  ? "btn btn--status btn--status-current"
                  : "btn btn--status"
              }
              disabled={
                locked ||
                busy ||
                STATUS_SEQUENCE.indexOf(status) <= STATUS_SEQUENCE.indexOf(emergency.status)
              }
              onClick={() => onStatus(status)}
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        {locked ? <p className="hint">Scan RFID to change status.</p> : null}
      </article>

      <article className="panel">
        <h3>Treatment notes</h3>
        {emergency.notes.length === 0 ? (
          <p className="hint">No notes yet.</p>
        ) : (
          <ol className="notes">
            {emergency.notes.map((item) => (
              <li key={item.id}>
                <strong>{item.authorName}</strong>
                <time>{new Date(item.createdAt).toLocaleTimeString()}</time>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        )}
        <form className="note-form" onSubmit={onNote}>
          <textarea
            rows={3}
            value={note}
            disabled={locked || busy}
            placeholder={locked ? "Unlock with RFID to write a note" : "Prototype treatment / observation"}
            onChange={(event) => setNote(event.target.value)}
          />
          <button type="submit" className="btn btn--primary" disabled={locked || busy || !note.trim()}>
            Save note
          </button>
        </form>
        {actionError ? <p className="error">{actionError}</p> : null}
      </article>
    </section>
  );
}

function Vital({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string | number;
  unit: string;
  tone: "ok" | "warn" | "bad";
}) {
  return (
    <div className={`vital vital--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{unit}</em>
    </div>
  );
}
