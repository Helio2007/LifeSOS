# LifeSOS

School diploma prototype that puts ambulance, ER, and hospital admin on one real-time emergency case — from the first paramedic report to treatment at the desk.

LifeSOS is a demonstrator for SMP “Hermann Gmeiner” Tiranë (Informatikë Softwaresh, 2026–2027). Fictional patient data only; not a certified clinical system.

## Stack

| Layer | App | Tech |
| --- | --- | --- |
| Desktop ER terminal | `apps/desktop` | Electron + React |
| Backend | `apps/backend` | Java + Spring Boot (REST, WebSocket, JWT/RBAC) |
| Command Center | `apps/web` | React |
| Paramedic | `apps/mobile` | React Native |
| Shared contracts | `packages/contracts` | TypeScript + JSON Schema |
| Database | (backend) | PostgreSQL |
| Hardware | desktop | USB RFID reader (keyboard wedge) |

## How the apps talk

Mobile, desktop, and web talk **only** to the Spring Boot backend. They do not call each other, and they do not open PostgreSQL.

```
paramedic (mobile)  --REST/JWT-->  Spring Boot  --PostgreSQL
ER terminal (desktop) --REST/JWT-->  Spring Boot
Command Center (web)  --REST/JWT-->  Spring Boot
Spring Boot --WebSocket--> desktop + web
USB RFID --UID keystrokes--> desktop --POST /api/rfid/verify--> Spring Boot
```

MVP event names, emergency statuses, and the RFID verify body live in `packages/contracts` and are described in [`docs/api-mvp.md`](docs/api-mvp.md).

This first cut ships an **in-process mock** REST/WebSocket inside the desktop app so the ER terminal, Flash Alert, and RFID wedge can be demoed before Spring Boot exists. Swap the mock client for the real API when the backend implements the same contracts.

## Repository layout

```
apps/desktop   Electron + React ER terminal (implemented)
apps/backend   Spring Boot — placeholder
apps/web       React Command Center — placeholder
apps/mobile    React Native paramedic app — placeholder
packages/contracts   Shared MVP types
docs/          API notes
```

## Run the ER terminal locally

Requires Node.js 20+.

```bash
npm install
npm run desktop
```

That starts the Vite/React UI at [http://127.0.0.1:5173](http://127.0.0.1:5173) (browser is enough for UI + mock RFID). For the Electron window:

```bash
npm run desktop:electron
```

Sign-in is RFID-only. Demo UIDs (type them and press Enter, or use the on-screen cards): `04A1B2C3` (physician), `04D4E5F6` (nurse). Mock verify returns staff identity, role, and session token.

While the desk is locked, patient/case details are not shown. A mock ambulance report is pushed on `emergency.created` shortly after load (or click **Simulate ambulance report**): the Flash Alert names that a case arrived, but PHI appears only after RFID unlock. **Lock desk** hides the case screen again.
