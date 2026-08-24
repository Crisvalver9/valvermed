// GET /api/availability?date=YYYY-MM-DD
// Devuelve las franjas del día y si cada una está libre u ocupada, según
// lo que ya exista en la agenda real de Google Calendar.
//
// Contrato (plan 2.3):
//   200 { date, slots: [{ start, end, available }, ...] }
//   400 { success: false, error: "invalid_date" }
//   500 { success: false, error: "availability_error" }
//
// Si la fecha es sábado/domingo devuelve slots: [] sin llamar a Calendar.

import { generateSlots, isWeekend, zonedTimeToUtc, addDays, TIMEZONE } from './lib/hours.js';
import { getBusyIntervals } from './lib/calendar.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const { date } = req.query || {};

  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return res.status(400).json({ success: false, error: 'invalid_date' });
  }

  if (isWeekend(date)) {
    return res.status(200).json({ date, slots: [] });
  }

  const slots = generateSlots(date);
  if (slots.length === 0) {
    return res.status(200).json({ date, slots: [] });
  }

  try {
    // Rango generoso del día completo (00:00 a 00:00 del día siguiente, hora
    // de Santiago) para traer todos los bloques ocupados de una sola vez.
    const dayStartUtc = zonedTimeToUtc(date, '00:00', TIMEZONE);
    const dayEndUtc = zonedTimeToUtc(addDays(date, 1), '00:00', TIMEZONE);

    const busy = await getBusyIntervals(dayStartUtc.toISOString(), dayEndUtc.toISOString());

    const result = slots.map((slot) => {
      const slotStartUtc = zonedTimeToUtc(date, slot.start.slice(11, 16), TIMEZONE);
      const slotEndUtc = zonedTimeToUtc(date, slot.end.slice(11, 16), TIMEZONE);

      const overlaps = busy.some((b) => slotStartUtc < b.end && slotEndUtc > b.start);

      return { start: slot.start, end: slot.end, available: !overlaps };
    });

    return res.status(200).json({ date, slots: result });
  } catch (err) {
    console.error('[api/availability] error consultando Calendar:', err);
    return res.status(500).json({ success: false, error: 'availability_error' });
  }
}
