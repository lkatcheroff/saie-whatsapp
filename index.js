require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  res.sendStatus(200);

  const body = req.body;
  const msg  = body?.message;
  if (!msg) return;

  const from = msg.from;
  const type = msg.type;
  const name = body?.conversation?.contact_name || from;

  console.log(`\nMensaje de ${name} (${from}) | tipo: ${type}`);

  if (type === 'text') {
    const texto = msg.text?.body;
    console.log(`  Texto: "${texto}"`);
    handleTextMessage(from, name, texto);
  } else if (type === 'image') {
    console.log(`  Imagen recibida`);
    handleImage(from, name, msg);
  } else if (type === 'audio') {
    console.log(`  Audio recibido`);
    handleAudio(from, name, msg);
  }
});

function handleTextMessage(from, name, text) {
  // TODO: lookup en usuarios_wa
  // TODO: si no existe → onboarding
  // TODO: si existe → router de actores
  console.log(`  → procesando texto de ${name}`);
}

function handleImage(from, name, msg) {
  // TODO: descargar, clasificar y validar con Vision AI
  console.log(`  → procesando imagen de ${name}`);
}

function handleAudio(from, name, msg) {
  // TODO: descargar y transcribir con Whisper
  console.log(`  → procesando audio de ${name}`);
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', sistema: 'SAIE WhatsApp' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SAIE WhatsApp corriendo en puerto ${PORT}`);
});
