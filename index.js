// ─── SAIE WHATSAPP · index.js ────────────────────────────────
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

const { getUsuarioWA }       = require('./bdd');
const { procesarOnboarding } = require('./onboarding');

// ─── WEBHOOK ENTRANTE DE KAPSO ───────────────────────────────
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // responder inmediatamente siempre

  const body = req.body;
  const msg  = body?.message;
  if (!msg) return;

  const from = msg.from;
  const type = msg.type;
  const name = body?.conversation?.contact_name || from;

  console.log(`\n📩 ${name} (${from}) | tipo: ${type}`);

  // ── Identificar si el número está registrado ──
  const usuario = await getUsuarioWA(from);

  if (!usuario) {
    // Número desconocido → onboarding
    console.log(`   → número no registrado, iniciando onboarding`);
    await procesarOnboarding(from, name, msg);
    return;
  }

  // Número registrado → router de actores
  console.log(`   → usuario registrado: rol=${usuario.rol}`);

  if (type === 'text') {
    await handleTextMessage(from, name, msg, usuario);
  } else if (type === 'image') {
    await handleImage(from, name, msg, usuario);
  } else if (type === 'audio') {
    await handleAudio(from, name, msg, usuario);
  }
});

// ─── HANDLERS PARA USUARIOS REGISTRADOS ─────────────────────
async function handleTextMessage(from, name, msg, usuario) {
  const texto = msg.text?.body;
  console.log(`   Texto: "${texto}"`);

  if (usuario.rol === 'familia') {
    // TODO: lógica familia - responder preguntas sobre docs, etc.
    console.log(`   → familia | prestacion_id: ${usuario.prestacion_id}`);
  } else if (usuario.rol === 'empleado') {
    // TODO: lógica empleado - registrar informe de texto
    console.log(`   → empleado | empleado_id: ${usuario.empleado_id}`);
  }
}

async function handleImage(from, name, msg, usuario) {
  console.log(`   Imagen de ${name}`);
  // TODO: descargar desde Kapso/Meta
  // TODO: clasificar tipo de documento
  // TODO: validar con GPT-4o Vision
}

async function handleAudio(from, name, msg, usuario) {
  console.log(`   Audio de ${name}`);
  // TODO: descargar audio
  // TODO: transcribir con Whisper
  // TODO: guardar en informes_empleados
}

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', sistema: 'SAIE WhatsApp', version: '2.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SAIE WhatsApp v2 corriendo en puerto ${PORT}`);
  console.log(`   Mock data: Norberto Alonso (alumno) | Angel Labruna (empleado)`);
});
