# LifeSOS web (Command Center)

React admin surface for emergencies, ambulances, and beds.

Not implemented in this PR. It will subscribe to the same Spring Boot WebSocket events (`emergency.created`, `emergency.updated`) defined in `packages/contracts`.

The web app talks **only** to the Spring Boot backend.
