// ─── SESIONES EN MEMORIA ──────────────────────────────────────
// Guarda el estado de cada conversación mientras dura el onboarding.
// En producción reemplazar por tabla sesiones_wa en Supabase.

const sesiones = new Map();

async function getSesion(phone) {
  return sesiones.get(phone) || null;
}

async function guardarSesion(phone, datos) {
  sesiones.set(phone, datos);
  console.log(`[SESION] ${phone} → paso: ${datos.paso}`);
}

async function eliminarSesion(phone) {
  sesiones.delete(phone);
  console.log(`[SESION] ${phone} → eliminada`);
}

module.exports = { getSesion, guardarSesion, eliminarSesion };
