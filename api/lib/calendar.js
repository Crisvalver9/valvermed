// Cliente autenticado de Google Calendar usando una cuenta de servicio.
// Ver plan 2.0 / 2.2: la cuenta de servicio tiene acceso de "Hacer cambios
// en los eventos" sobre la agenda específica del Dr. Valverde (compartida
// manualmente desde Google Calendar), no permisos amplios del proyecto.

import { google } from 'googleapis';

let cachedClient = null;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

/**
 * Cliente de Calendar (memoizado dentro de la misma invocación/caliente de
 * la función serverless). La causa #1 de "funciona local, falla en Vercel"
 * en este patrón: las variables de entorno de Vercel son de una sola línea,
 * así que la clave privada se pega con "\n" literal y hay que reemplazarlo
 * por saltos de línea reales antes de pasarla al JWT client.
 */
export function getCalendarClient() {
  if (cachedClient) return cachedClient;

  const email = getRequiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const rawKey = getRequiredEnv('GOOGLE_PRIVATE_KEY');
  const privateKey = rawKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  cachedClient = google.calendar({ version: 'v3', auth });
  return cachedClient;
}

export function getCalendarId() {
  return getRequiredEnv('GOOGLE_CALENDAR_ID');
}

/**
 * Devuelve los bloques ocupados (busy) de la agenda entre timeMinISO y
 * timeMaxISO (ambos strings RFC3339 con offset, ej. "...T00:00:00-04:00").
 */
export async function getBusyIntervals(timeMinISO, timeMaxISO) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMinISO,
      timeMax: timeMaxISO,
      items: [{ id: calendarId }],
    },
  });

  const calendarInfo = res.data.calendars?.[calendarId];
  if (calendarInfo?.errors?.length) {
    // Ej: la agenda no fue compartida con la cuenta de servicio, o el ID está mal.
    throw new Error(
      `freebusy.query devolvió errores para ${calendarId}: ${JSON.stringify(calendarInfo.errors)}`
    );
  }

  const busy = calendarInfo?.busy || [];
  return busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/**
 * Crea el evento real en Calendar. startDateTime/endDateTime van sin offset
 * (ej. "2026-08-24T09:00:00") y se interpretan según `timeZone`, que es lo
 * que Google Calendar espera para eventos con hora local explícita.
 */
export async function createCalendarEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  timeZone,
  patientEmail,
  sendUpdates = 'none',
}) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const requestBody = {
    summary,
    description,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
  };

  if (patientEmail) {
    requestBody.attendees = [{ email: patientEmail }];
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody,
    sendUpdates: patientEmail ? sendUpdates : 'none',
  });

  return res.data;
}
