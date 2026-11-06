# LifeSOS mobile (paramedic)

React Native app for ambulance crews to open an emergency case (patient, symptoms, vitals).

Not implemented in this PR. Creating a case on the real backend should persist in PostgreSQL and emit `emergency.created` so the ER desktop Flash Alert fires.

The mobile app talks **only** to the Spring Boot backend.
