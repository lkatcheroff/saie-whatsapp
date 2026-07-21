// ─── FLUJO DE ONBOARDING ─────────────────────────────────────
// Se ejecuta cuando llega un mensaje de un número no registrado.
// Guarda el estado en sesiones.js (en memoria por ahora).

const { enviarTexto, enviarTemplate } = require('./whatsapp');
const { buscarPrestacionPorNombre, buscarEmpleadoPorNombre, crearUsuarioWA } = require('./bdd');
const { getSesion, guardarSesion, eliminarSesion } = require('./sesiones');

// ─── ENTRY POINT ─────────────────────────────────────────────
async function procesarOnboarding(from, name, msg) {
  const sesion = await getSesion(from);
  const paso   = sesion?.paso || 'inicio';

  console.log(`[ONBOARDING] ${from} | paso: ${paso}`);

  if (paso === 'inicio')                  return pasoInicio(from);
  if (paso === 'esperando_rol')           return pasoRol(from, msg, sesion);
  if (paso === 'esperando_nombre')        return pasoNombre(from, msg, sesion);
  if (paso === 'esperando_confirmacion')  return pasoConfirmacion(from, msg, sesion);
}

// ─── PASO 1: Saludar y preguntar rol ─────────────────────────
async function pasoInicio(from) {
  await guardarSesion(from, { paso: 'esperando_rol' });
  // Intenta con template, si falla usa texto libre (ventana 24hs)
  await enviarTemplate(from, 'bienvenida_registro');
}

// ─── PASO 2: Procesar rol ────────────────────────────────────
async function pasoRol(from, msg, sesion) {
  const texto = msg.text?.body?.toLowerCase().trim() || '';

  const esFamilia  = texto.includes('familiar') || texto.includes('familia')   || texto === '1';
  const esEmpleado = texto.includes('profesional') || texto.includes('equipo') || texto === '2';

  if (!esFamilia && !esEmpleado) {
    await enviarTexto(from, 'No entendí tu respuesta. ¿Sos *familiar de un alumno* o *profesional del equipo*?');
    return;
  }

  const rol = esFamilia ? 'familia' : 'empleado';
  await guardarSesion(from, { paso: 'esperando_nombre', rol });

  if (rol === 'familia') {
    await enviarTexto(from, '¿Cuál es el nombre del alumno?');
  } else {
    await enviarTexto(from, '¿Cuál es tu nombre completo?');
  }
}

// ─── PASO 3: Buscar en BDD ───────────────────────────────────
async function pasoNombre(from, msg, sesion) {
  const texto = msg.text?.body?.trim() || '';
  const rol   = sesion.rol;

  let resultados;
  if (rol === 'familia') {
    resultados = await buscarPrestacionPorNombre(texto);
  } else {
    resultados = await buscarEmpleadoPorNombre(texto);
  }

  if (!resultados || resultados.length === 0) {
    await enviarTexto(from, `No encontramos a "${texto}" en el sistema. Verificá el nombre e intentá de nuevo.`);
    return;
  }

  const entidad = resultados[0];
  await guardarSesion(from, { ...sesion, paso: 'esperando_confirmacion', entidad });

  if (rol === 'familia') {
    await enviarTexto(from, `¿Confirmás que sos familiar de *${entidad.nombre_alumno}*?\n\nRespondé *Sí* o *No*.`);
  } else {
    await enviarTexto(from, `¿Confirmás que sos *${entidad.nombre}* del equipo?\n\nRespondé *Sí* o *No*.`);
  }
}

// ─── PASO 4: Confirmar y registrar ───────────────────────────
async function pasoConfirmacion(from, msg, sesion) {
  const texto    = msg.text?.body?.toLowerCase().trim() || '';
  const confirma = ['sí', 'si', 's', 'yes', 'dale', 'ok'].includes(texto);
  const niega    = ['no', 'n'].includes(texto);

  if (niega) {
    await guardarSesion(from, { paso: 'esperando_nombre', rol: sesion.rol });
    await enviarTexto(from, 'Entendido. ¿Cuál es el nombre correcto?');
    return;
  }

  if (!confirma) {
    await enviarTexto(from, 'Respondé *Sí* para confirmar o *No* para corregir.');
    return;
  }

  // Registrar en usuarios_wa
  const { entidad, rol } = sesion;
  await crearUsuarioWA({
    phone_number:  from,
    rol,
    prestacion_id: rol === 'familia'  ? entidad.id : null,
    empleado_id:   rol === 'empleado' ? entidad.id : null,
  });

  await eliminarSesion(from);

  if (rol === 'familia') {
    await enviarTexto(from, `✅ Listo, quedaste registrado/a como familiar de ${entidad.nombre_alumno}. Ya podés enviarnos documentación por acá.`);
  } else {
    await enviarTexto(from, `✅ Listo, quedaste registrado/a como profesional del equipo. Ya podés enviarnos informes por acá.`);
  }
}

module.exports = { procesarOnboarding };
