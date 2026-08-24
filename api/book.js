// POST /api/book
// body: { date, start, patientName, patientPhone, patientEmail?, reason? }
//
// Contrato (plan 2.3):
//   201 { success: true, eventId, confirmedStart }
//   409 { success: false, error: "slot_unavailable" }   -> franja ya tomada
//   422 { success: false, error: "outside_business_hours" }
//   400 { success: false, error: "missing_fields" | "invalid_format" }
//   500 { success: false, error: "booking_error" }
//
// Lógica crítica — prevención de doble reserva: NUNCA confiar en que el
// frontend llamó a /api/availability hace un momento. Este endpoint vuelve
// a chequear disponibilidad justo antes de escribir el evento. Esto no es
// una transacción atómica perfecta (Calendar no ofrece "crear solo si"), así
// que queda una ventana de carrera pequeña entre el freebusy.query y el
// events.insert — aceptable para el volumen de una sola clínica, pero
// documentado como tal, no escondido. Endurecimiento opcional a futuro:
// releer el evento recién creado y cancelar si detecta duplicado.

import { isWithinBusinessHours, addMinutesToTime, zonedTimeToUtc, SLOT_DURATION_MINUTES, TIMEZONE } from './lib/hours.js';
import { getBusyIntervals, createCalendarEvent } from './lib/calendar.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// Definir con la clínica si Calendar debe mandar invitación automática por
// email al paciente (sendUpdates: 'all') o si la confirmación va solo por
// WhatsApp (sendUpdates: 'none'). Por ahora, solo se invita si el paciente
// dejó su email, y se puede desactivar cambiando este valor a 'none'.
const SEND_UPDATES_WHEN_EMAIL_PROVIDED = 'all';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const body = req.body || {};
  const { date, start, patientName, patientPhone, patientEmail, reason } = body;

  if (!date || !start || !patientName || !patientPhone) {
    return res.status(400).json({ success: false, error: 'missing_fields' });
  }

  if (typeof date !== 'string' || !DATE_RE.test(date) || typeof start !== 'string' || !TIME_RE.test(start)) {
    return res.status(400).json({ success: false, error: 'invalid_format' });
  }

  if (patientEmail && typeof patientEmail === 'string' && patientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())) {
    return res.status(400).json({ success: false, error: 'invalid_format' });
  }

  // Barrera real de horario — no confiar en que el frontend ya validó esto.
  if (!isWithinBusinessHours(date, start)) {
    return res.status(422).json({ success: false, error: 'outside_business_hours' });
  }

  const end = addMinutesToTime(start, SLOT_DURATION_MINUTES);

  try {
    const slotStartUtc = zonedTimeToUtc(date, start, TIMEZONE);
    const slotEndUtc = zonedTimeToUtc(date, end, TIMEZONE);

    // Revalidación justo antes de escribir (ver nota de doble reserva arriba).
    const busy = await getBusyIntervals(slotStartUtc.toISOString(), slotEndUtc.toISOString());
    const isTaken = busy.some((b) => slotStartUtc < b.end && slotEndUtc > b.start);

    if (isTaken) {
      return res.status(409).json({ success: false, error: 'slot_unavailable' });
    }

    const cleanEmail = typeof patientEmail === 'string' ? patientEmail.trim() : '';
    const cleanReason = typeof reason === 'string' ? reason.trim() : '';

    const descriptionLines = [
      `Paciente: ${patientName}`,
      `Teléfono: ${patientPhone}`,
    ];
    if (cleanEmail) descriptionLines.push(`Email: ${cleanEmail}`);
    if (cleanReason) descriptionLines.push(`Motivo: ${cleanReason}`);
    descriptionLines.push('Agendado automáticamente desde el sitio web de Valvermed.');

    const event = await createCalendarEvent({
      summary: `Consulta — ${patientName}`,
      description: descriptionLines.join('\n'),
      startDateTime: `${date}T${start}:00`,
      endDateTime: `${date}T${end}:00`,
      timeZone: TIMEZONE,
      patientEmail: cleanEmail || undefined,
      sendUpdates: SEND_UPDATES_WHEN_EMAIL_PROVIDED,
    });

    return res.status(201).json({
      success: true,
      eventId: event.id,
      confirmedStart: `${date}T${start}:00`,
    });
  } catch (err) {
    console.error('[api/book] error creando evento en Calendar:', err);
    return res.status(500).json({ success: false, error: 'booking_error' });
  }
}
