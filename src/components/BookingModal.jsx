import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, CheckCircle2, Loader2, AlertCircle,
  MessageCircle, ChevronLeft,
} from 'lucide-react';

// Canal alternativo — no se elimina. Se usa como salida si el agendamiento
// online falla por cualquier motivo (ver plan 2.4).
const WHATSAPP_FALLBACK = 'https://wa.me/56963029722';

function formatSlotLabel(startISO) {
  // startISO: "YYYY-MM-DDTHH:MM:00" (hora local de la clínica)
  return startISO.slice(11, 16);
}

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

function todayInSantiago() {
  // Fecha mínima seleccionable en el input date — hoy, en zona horaria de Chile.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
}

const initialForm = { patientName: '', patientPhone: '', patientEmail: '', reason: '' };

export default function BookingModal({ open, onClose }) {
  const [step, setStep] = useState('date'); // date | slots | form | success | error
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  const resetAll = useCallback(() => {
    setStep('date');
    setDate('');
    setSlots([]);
    setSelectedSlot(null);
    setForm(initialForm);
    setErrorMsg('');
    setConfirmed(null);
    setLoadingSlots(false);
    setSubmitting(false);
  }, []);

  // Limpia el estado un momento después de cerrar, para no ver el flash del
  // paso "date" mientras el modal hace fade-out.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(resetAll, 300);
      return () => clearTimeout(t);
    }
  }, [open, resetAll]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  async function fetchAvailability(selectedDate) {
    setLoadingSlots(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/availability?date=${selectedDate}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'availability_error');
      setSlots(data.slots || []);
    } catch {
      setErrorMsg('No pudimos cargar los horarios disponibles. Intenta nuevamente o escríbenos por WhatsApp.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
      setStep('slots');
    }
  }

  function handleDateChange(e) {
    const value = e.target.value;
    setDate(value);
    if (value) fetchAvailability(value);
  }

  function handleSelectSlot(slot) {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setErrorMsg('');
    setStep('form');
  }

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patientName.trim() || !form.patientPhone.trim() || !selectedSlot) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          start: formatSlotLabel(selectedSlot.start),
          patientName: form.patientName.trim(),
          patientPhone: form.patientPhone.trim(),
          patientEmail: form.patientEmail.trim() || undefined,
          reason: form.reason.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (res.status === 201 && data.success) {
        setConfirmed(data);
        setStep('success');
        return;
      }

      if (res.status === 409) {
        setErrorMsg('Ese horario se acaba de ocupar. Elige otro horario disponible.');
        await fetchAvailability(date);
        setStep('slots');
        return;
      }

      setErrorMsg('No pudimos confirmar tu hora. Intenta nuevamente o escríbenos por WhatsApp.');
      setStep('error');
    } catch {
      setErrorMsg('No pudimos confirmar tu hora. Intenta nuevamente o escríbenos por WhatsApp.');
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    if (step === 'form') setStep('slots');
    else if (step === 'slots') setStep('date');
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Agendar hora"
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5">
                {(step === 'slots' || step === 'form') && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="p-1 -ml-1 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
                    aria-label="Volver"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">Agendar Hora</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-5 sm:px-6 py-5 overflow-y-auto">
              {step === 'date' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Elige una fecha para ver los horarios disponibles del Dr. Valverde.
                  </p>
                  <label htmlFor="booking-date" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Fecha
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="booking-date"
                      type="date"
                      min={todayInSantiago()}
                      value={date}
                      onChange={handleDateChange}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-valvermed-teal/40 focus:border-valvermed-teal"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">
                    Atención de lunes a viernes, 09:00 a 20:00 hrs.
                  </p>
                </div>
              )}

              {step === 'slots' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Horarios para <strong className="text-gray-900 capitalize">{formatDateLabel(date)}</strong>
                  </p>

                  {loadingSlots && (
                    <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm">Buscando horarios...</span>
                    </div>
                  )}

                  {!loadingSlots && errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg p-3 mb-4">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {!loadingSlots && !errorMsg && slots.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 mb-3">
                        No hay horarios disponibles ese día (puede ser fin de semana).
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep('date')}
                        className="text-valvermed-teal text-sm font-semibold hover:underline"
                      >
                        Elegir otra fecha
                      </button>
                    </div>
                  )}

                  {!loadingSlots && slots.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => handleSelectSlot(slot)}
                          className={`py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${
                            slot.available
                              ? 'border-gray-200 text-gray-700 hover:border-valvermed-teal hover:bg-valvermed-teal/5 hover:text-valvermed-teal'
                              : 'border-gray-100 text-gray-300 line-through cursor-not-allowed bg-gray-50'
                          }`}
                        >
                          {formatSlotLabel(slot.start)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 'form' && selectedSlot && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 bg-valvermed-teal/5 border border-valvermed-teal/20 rounded-lg px-3.5 py-2.5 text-sm text-valvermed-teal font-semibold">
                    <Clock size={15} className="shrink-0" />
                    <span className="capitalize">
                      {formatDateLabel(date)} — {formatSlotLabel(selectedSlot.start)} hrs
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg p-3">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="patientName" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nombre completo *
                    </label>
                    <input
                      id="patientName"
                      required
                      type="text"
                      value={form.patientName}
                      onChange={(e) => updateForm('patientName', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-valvermed-teal/40 focus:border-valvermed-teal"
                      placeholder="Ej: María Pérez"
                    />
                  </div>

                  <div>
                    <label htmlFor="patientPhone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Teléfono *
                    </label>
                    <input
                      id="patientPhone"
                      required
                      type="tel"
                      value={form.patientPhone}
                      onChange={(e) => updateForm('patientPhone', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-valvermed-teal/40 focus:border-valvermed-teal"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div>
                    <label htmlFor="patientEmail" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email (opcional)
                    </label>
                    <input
                      id="patientEmail"
                      type="email"
                      value={form.patientEmail}
                      onChange={(e) => updateForm('patientEmail', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-valvermed-teal/40 focus:border-valvermed-teal"
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Motivo de consulta (opcional)
                    </label>
                    <textarea
                      id="reason"
                      rows={2}
                      value={form.reason}
                      onChange={(e) => updateForm('reason', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-valvermed-teal/40 focus:border-valvermed-teal resize-none"
                      placeholder="Cuéntanos brevemente el motivo"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-valvermed-teal hover:bg-valvermed-teal/90 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    <span>{submitting ? 'Confirmando...' : 'Confirmar Hora'}</span>
                  </button>
                </form>
              )}

              {step === 'success' && confirmed && selectedSlot && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-valvermed-teal/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-valvermed-teal" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1.5">¡Hora confirmada!</h3>
                  <p className="text-sm text-gray-600 mb-1 capitalize">
                    {formatDateLabel(date)} a las {formatSlotLabel(selectedSlot.start)} hrs
                  </p>
                  <p className="text-xs text-gray-400 mb-6">
                    Te esperamos en O'Higgins 678, Piso 2, Castro.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Listo
                  </button>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={28} className="text-red-500" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1.5">No pudimos agendar tu hora</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {errorMsg || 'Ocurrió un error inesperado.'}
                  </p>
                  <a
                    href={WHATSAPP_FALLBACK}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-valvermed-teal hover:bg-valvermed-teal/90 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    <span>Agendar por WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
