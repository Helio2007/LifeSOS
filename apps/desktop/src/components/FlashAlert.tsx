import { useEr } from "../state/ErSession";
import { RfidCards } from "./RfidCards";

export function FlashAlert() {
  const { pendingAlert, locked, ackAlert } = useEr();
  if (!pendingAlert) return null;

  if (locked) {
    return (
      <div className="flash" role="alertdialog" aria-modal="true" aria-labelledby="flash-title">
        <div className="flash__pulse" />
        <div className="flash__card">
          <p className="flash__kicker">Incoming emergency</p>
          <h2 id="flash-title">
            {pendingAlert.critical ? "Critical case arrived" : "New case arrived"}
          </h2>
          <p className="flash__meta">Scan your RFID card to view the patient.</p>
          <div className="flash__unlock">
            <RfidCards />
          </div>
          <button type="button" className="btn btn--alert" onClick={ackAlert}>
            Silence alarm
          </button>
        </div>
      </div>
    );
  }

  const { patient, vitals, ambulanceId, symptoms } = pendingAlert;

  return (
    <div className="flash" role="alertdialog" aria-modal="true" aria-labelledby="flash-title">
      <div className="flash__pulse" />
      <div className="flash__card">
        <p className="flash__kicker">Incoming emergency</p>
        <h2 id="flash-title">{patient.fullName}</h2>
        <p className="flash__meta">
          {patient.age}y · {patient.sex}
          {ambulanceId ? ` · ${ambulanceId}` : ""}
          {pendingAlert.critical ? " · CRITICAL" : ""}
        </p>
        <dl className="flash__vitals">
          <div>
            <dt>HR</dt>
            <dd>{vitals.heartRateBpm}</dd>
          </div>
          <div>
            <dt>BP</dt>
            <dd>
              {vitals.systolicMmhg}/{vitals.diastolicMmhg}
            </dd>
          </div>
          <div>
            <dt>SpO2</dt>
            <dd>{vitals.spo2Percent}%</dd>
          </div>
        </dl>
        <p className="flash__symptoms">{symptoms.join(" · ")}</p>
        <button type="button" className="btn btn--alert" onClick={ackAlert}>
          Open case
        </button>
      </div>
    </div>
  );
}
