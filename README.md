# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Agendamiento real a Google Calendar (Etapa 2)

Este proyecto incluye funciones serverless de Vercel bajo `api/` que conectan
el modal de agendamiento del sitio con la agenda real de Google Calendar del
Dr. Valverde, usando una cuenta de servicio (ver `api/lib/calendar.js` y
`api/lib/hours.js`).

### Variables de entorno

Copia `.env.example` a `.env` y completa los 3 valores (obtenidos al crear la
cuenta de servicio en Google Cloud Console y compartir la agenda con ella):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_CALENDAR_ID`

En Vercel, estas mismas variables se configuran en **Project Settings →
Environment Variables** (nunca en el código ni en el repo).

**Detalle importante sobre `GOOGLE_PRIVATE_KEY`:** la clave privada trae
saltos de línea reales, pero las variables de entorno de Vercel son de una
sola línea. Pégala con `\n` literal (tal como viene en el campo
`private_key` del JSON de la cuenta de servicio) — `api/lib/calendar.js` hace
`.replace(/\\n/g, '\n')` antes de pasarla al cliente de Google. Esta es la
causa #1 de "funciona local, falla en Vercel" en este patrón.

### Desarrollo local

`vite dev` **no sirve las rutas `/api/*`** — esas solo existen bajo `vercel
dev` o ya desplegado en Vercel. Para probar el agendamiento en local:

```bash
npm install -g vercel   # si no lo tienes instalado
vercel dev
```

Esto levanta tanto el frontend (Vite) como las funciones de `api/` juntas,
leyendo las variables desde tu `.env` local.

### Contrato de la API

- `GET /api/availability?date=YYYY-MM-DD` → `{ date, slots: [{ start, end, available }] }`.
  Devuelve `slots: []` sin consultar Calendar si la fecha es sábado/domingo.
- `POST /api/book` con `{ date, start, patientName, patientPhone, patientEmail?, reason? }`:
  - `201` → hora creada: `{ success: true, eventId, confirmedStart }`
  - `409` → la franja ya fue tomada por otra persona: `{ success: false, error: "slot_unavailable" }`
  - `422` → fuera del horario de atención: `{ success: false, error: "outside_business_hours" }`

`book.js` siempre revalida disponibilidad justo antes de crear el evento
(nunca confía en que el frontend consultó `/api/availability` hace un
momento). Esto no es una transacción atómica perfecta — Calendar no ofrece
"crear solo si está libre" — así que queda una ventana de carrera pequeña,
aceptable para el volumen de una sola clínica, pero documentada como tal.
