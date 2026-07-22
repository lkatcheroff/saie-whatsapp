// ─── CLIENTE WHATSAPP VÍA KAPSO ──────────────────────────────
const { WhatsAppClient } = require('@kapso/whatsapp-cloud-api');

const client = new WhatsAppClient({
  baseUrl: 'https://api.kapso.ai/meta/whatsapp',
  kapsoApiKey: process.env.KAPSO_API_KEY,
});

const PHONE_ID = process.env.KAPSO_PHONE_NUMBER_ID;

// Enviar texto libre (dentro de ventana 24hs)
async function enviarTexto(to, texto) {
  try {
    await client.messages.sendText({
      phoneNumberId: PHONE_ID,
      to,
      body: texto,
    });
    console.log(`[WA] ✓ texto enviado a ${to}`);
  } catch (err) {
    console.error(`[WA] ✗ error enviando texto a ${to}:`, err.message);
  }
}

// Enviar template aprobado (puede iniciar conversación sin ventana 24hs)
async function enviarTemplate(to, templateName, variables = []) {
  try {
    const components = variables.length > 0
      ? [{ type: 'body', parameters: variables.map(v => ({ type: 'text', text: v })) }]
      : [];

    await client.messages.templateSender.send({
      phoneNumberId: PHONE_ID,
      to,
      template: {
        name: templateName,
        language: { code: 'es' },
        components,
      },
    });
    console.log(`[WA] ✓ template "${templateName}" enviado a ${to}`);
  } catch (err) {
    console.error(`[WA] ✗ error enviando template "${templateName}":`, err.message);
  }
}

module.exports = { enviarTexto, enviarTemplate };
