# LifeSOS API — MVP contracts

Shared types live in `packages/contracts` (TypeScript + JSON Schema). This page is the human copy of the same freeze. Spring Boot should implement these shapes; desktop, web, and mobile consume them and never talk to each other.

All timestamps are ISO-8601 UTC.

## Emergency status

```
CREATED → EN_ROUTE → ARRIVED → IN_TREATMENT → COMPLETED
```

| Status | Meaning (demo) |
| --- | --- |
| `CREATED` | Paramedic opened the case on the ambulance |
| `EN_ROUTE` | Ambulance is moving toward the hospital |
| `ARRIVED` | Patient is in the ER |
| `IN_TREATMENT` | Staff started treatment / notes |
| `COMPLETED` | Case closed for the demo path |

TypeScript: `EmergencyStatus` in `packages/contracts/src/emergency.ts`  
JSON: `packages/contracts/json/emergency-status.json`

The `Emergency` payload also carries patient, symptoms, vitals, and treatment notes (`packages/contracts/json/emergency.json`).

## WebSocket events

Clients subscribe to the Spring Boot broker. Event `type` is the routing key.

### `emergency.created`

Pushed when a new case is stored. The ER terminal must Flash Alert + play the demo alarm.

```json
{
  "type": "emergency.created",
  "occurredAt": "2026-11-06T18:04:00.000Z",
  "payload": { "id": "emg-…", "status": "CREATED", "patient": {}, "symptoms": [], "vitals": {}, "notes": [] }
}
```

JSON Schema: `packages/contracts/json/emergency-created.json`

### `emergency.updated`

Pushed after status or notes change (RFID-authenticated staff on the ER terminal, or other clients via REST).

```json
{
  "type": "emergency.updated",
  "occurredAt": "2026-11-06T18:12:00.000Z",
  "payload": { "id": "emg-…", "status": "IN_TREATMENT" }
}
```

JSON Schema: `packages/contracts/json/emergency-updated.json`

`payload` is the full current `Emergency` object, not a patch.

## RFID verify

USB readers are treated as HID keyboard wedges: they type the card UID and send Enter. Desktop buffers those keystrokes and POSTs them.

```
POST /api/rfid/verify
Content-Type: application/json
```

Request (`packages/contracts/json/rfid-verify-request.json`):

```json
{ "uid": "04A1B2C3" }
```

Success (`packages/contracts/json/rfid-verify-response.json`):

```json
{
  "staffId": "staff-elira",
  "name": "Dr. Elira Hoxha",
  "role": "PHYSICIAN",
  "token": "…"
}
```

Unknown UID → `401` or `404` with no staff token. The ER terminal uses this response as the **session**: identity, role, and token. There is no username/password path on the desk. Until a successful verify, the UI stays on a lock screen and must not show patient/case details (Flash Alert may only say that a case arrived).

`role` values used in the prototype: `PHYSICIAN` | `NURSE` | `PARAMEDIC` | `ADMIN`.

## Desktop-only until backend exists

The ER terminal ships with an in-process mock of the routes above plus:

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/emergencies` | List open cases (rendered only after RFID unlock) |
| `PATCH` | `/api/emergencies/{id}/status` | Body `{ "status": "ARRIVED" }` |
| `POST` | `/api/emergencies/{id}/notes` | Body `{ "text": "…" }` |

Status and notes mocks emit `emergency.updated` on the in-process bus so the UI stays event-driven. When Spring Boot is up, point the desktop client at the real base URL and drop the mock.
