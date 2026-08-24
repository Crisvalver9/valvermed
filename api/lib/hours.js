// Horario de la clínica + generación de franjas de agendamiento.
// Todo lo relativo a "qué día es" y "qué hora es" para el paciente se maneja
// en zona horaria America/Santiago, independientemente de en qué servidor/
// región corra la función serverless de Vercel.

export const TIMEZONE = 'America/Santiago';

// Horario de atención: lunes a viernes, 09:00 a 20:00.
// Confirmar con la clínica si esto cambia (ver plan 2.3).
export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 20;

// Duración de cada consulta / franja agendable.
// 30 min es un default razonable — confirmar con la clínica.
export const SLOT_DURATION_MINUTES = 30;

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * ¿El día (YYYY-MM-DD) cae en sábado o domingo?
 * Se calcula sobre el calendario tal cual (sin conversión de zona horaria),
 * porque dateStr ya representa el día local de la clínica.
 */
export function isWeekend(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=domingo, 6=sábado
  return day === 0 || day === 6;
}

/**
 * Suma minutos a un string "HH:MM" y devuelve otro string "HH:MM".
 */
export function addMinutesToTime(timeStr, minutesToAdd) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutesToAdd;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${pad(newH)}:${pad(newM)}`;
}

/**
 * Suma (o resta) días a un string "YYYY-MM-DD".
 */
export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * Genera las franjas del día dentro del horario de atención.
 * Devuelve [] si es fin de semana, sin necesidad de llamar a Calendar.
 * Cada franja: { start: "YYYY-MM-DDTHH:MM:00", end: "YYYY-MM-DDTHH:MM:00" }
 * (hora local de la clínica, sin offset — se combina con TIMEZONE al usarla).
 */
export function generateSlots(dateStr) {
  if (isWeekend(dateStr)) return [];

  const slots = [];
  const startMinutes = BUSINESS_START_HOUR * 60;
  const endMinutes = BUSINESS_END_HOUR * 60;

  let cursor = startMinutes;
  while (cursor + SLOT_DURATION_MINUTES <= endMinutes) {
    const startH = Math.floor(cursor / 60);
    const startM = cursor % 60;
    const endTotal = cursor + SLOT_DURATION_MINUTES;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    slots.push({
      start: `${dateStr}T${pad(startH)}:${pad(startM)}:00`,
      end: `${dateStr}T${pad(endH)}:${pad(endM)}:00`,
    });

    cursor += SLOT_DURATION_MINUTES;
  }

  return slots;
}

/**
 * Valida que un horario "HH:MM" en un día "YYYY-MM-DD" caiga dentro del
 * horario de atención y esté alineado a la grilla de franjas.
 * Usado por book.js como barrera real (no confiar solo en el frontend).
 */
export function isWithinBusinessHours(dateStr, timeStr) {
  if (isWeekend(dateStr)) return false;
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;

  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return false;

  const totalMinutes = h * 60 + m;
  const startMinutes = BUSINESS_START_HOUR * 60;
  const endMinutes = BUSINESS_END_HOUR * 60;

  if (totalMinutes < startMinutes) return false;
  if (totalMinutes + SLOT_DURATION_MINUTES > endMinutes) return false;
  if ((totalMinutes - startMinutes) % SLOT_DURATION_MINUTES !== 0) return false;

  return true;
}

/**
 * Convierte una hora "local" de la clínica (YYYY-MM-DD + HH:MM en `timeZone`)
 * a un objeto Date UTC real. Se usa para comparar franjas contra los bloques
 * "busy" que devuelve freebusy.query (que sí requiere timestamps con offset).
 *
 * No agrega dependencias externas: usa Intl.DateTimeFormat para calcular el
 * offset real de `timeZone` en ese instante (incluye cambios de horario de
 * verano en Chile) y ajusta una vez más por si el instante cae justo en una
 * transición de DST.
 */
function getTimeZoneOffsetMs(utcDate, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = dtf.formatToParts(utcDate).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return asUTC - utcDate.getTime();
}

export function zonedTimeToUtc(dateStr, timeStr, timeZone = TIMEZONE) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  let utcTime = utcGuess - offset;

  // Reintenta una vez por si el instante cae justo en el cambio de DST.
  const offsetCheck = getTimeZoneOffsetMs(new Date(utcTime), timeZone);
  if (offsetCheck !== offset) {
    utcTime = utcGuess - offsetCheck;
  }

  return new Date(utcTime);
}
