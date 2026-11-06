# LifeSOS backend

Spring Boot API: REST, WebSocket, JWT/RBAC, PostgreSQL.

Not implemented in this PR. The desktop app currently uses an in-process mock that follows `packages/contracts` and `docs/api-mvp.md`.

All clients (mobile, desktop, web) talk **only** to this service — never to each other and never directly to the database.
