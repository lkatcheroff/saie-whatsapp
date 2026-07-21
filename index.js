require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

const { getUsuarioWA }       = require('./bdd');
const { getSesion }          = require('./sesiones');
const { procesarOnboarding } = require('./onboarding');

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const body = req.body;
  const msg  = body?.message;
  if (!msg) return;

  const from = msg.from;
  const type = msg.type;
  const name = body?.conversation?.contact_name || from;

  console.log(`\n📩 ${name} (${from}) | tipo: ${type}`);

  // ── 1. ¿Hay una sesión de onboarding activa? ──
  const sesion = await getSesion(from);
  if (sesion) {
    console.log(`   → onboarding en curso, paso: ${sesion.paso}`);
    await procesarOnboarding(from, name, msg);
    return;
  }

  // ── 2. ¿El número está registrado en usuarios_wa? ──
  const usuario = await getUsuarioWA(from);
  if (!usuario) {
    console.log(`   → número nuevo, iniciando onboarding`);
    await procesarOnboarding(from, name, msg);
    return;
  }

  // ── 3. Usuario registrado → router de actores ──
  console.log(`   → usuario registrado: rol=${usuario.rol}`);

  if (type === 'text')  await handleTextMessage(from, name, msg, usuario);
  if (type === 'image') await handleImage(from, name, msg, usuario);
  if (type === 'audio') await handleAudio(from, name, msg, usuario);
});

async function handleTextMessage(from, name, msg, usuario) {
  const texto = msg.text?.body;
  console.log(`   Texto: "${texto}"`);
  if (usuario.rol === 'familia') {
    console.log(`   → familia | prestacion_id: ${usuario.prestacion_id}`);
    // TODO: lógica familia
  } else {
    console.log(`   → empleado | empleado_id: ${usuario.empleado_id}`);
    // TODO: lógica empleado
  }
}

async function handleImage(from, name, msg, usuario) {
  console.log(`   Imagen de ${name}`);
  // TODO: descargar, clasificar, validar con Vision AI
}

async function handleAudio(from, name, msg, usuario) {
  console.log(`   Audio de ${name}`);
  // TODO: transcribir con Whisper
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', sistema: 'SAIE WhatsApp', version: '3.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SAIE WhatsApp v3 corriendo en puerto ${PORT}`);
  console.log(`   Mock: Norberto Alonso (alumno) | Angel Labruna (empleado)`);
});
