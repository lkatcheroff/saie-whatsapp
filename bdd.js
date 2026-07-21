// ─── CAPA DE ACCESO A BDD ────────────────────────────────────
// Por ahora: datos hardcodeados para testing.
// TODO: reemplazar cada función con fetch al endpoint real de SAIE.

const BASE_URL = process.env.SAIE_API_URL || 'http://localhost:4000';

// ── MOCK DATA ─────────────────────────────────────────────────
// Casos de prueba hardcodeados hasta tener endpoints reales.
const MOCK_PRESTACIONES = [
  {
    id: 'prestacion-norberto-001',
    nombre_alumno: 'Norberto Alonso',
    estado: 'activa',
    docs_requeridos: ['dni_frente', 'dni_dorso', 'cert_escolar'],
  },
];

const MOCK_EMPLEADOS = [
  {
    id: 'empleado-labruna-001',
    nombre: 'Angel Labruna',
    tipo: 'retas',
    activo: true,
    prestaciones: ['prestacion-norberto-001'],
  },
];

const MOCK_USUARIOS_WA = new Map(); // simula la tabla usuarios_wa

// ── PRESTACIONES ──────────────────────────────────────────────
async function buscarPrestacionPorNombre(nombre) {
  // TODO: GET ${BASE_URL}/api/prestaciones?nombre=${nombre}&activa=true
  console.log(`[BDD] buscarPrestacion: "${nombre}"`);

  const resultado = MOCK_PRESTACIONES.filter(p =>
    p.nombre_alumno.toLowerCase().includes(nombre.toLowerCase())
  );

  return resultado.length > 0 ? resultado : null;
}

// ── EMPLEADOS ─────────────────────────────────────────────────
async function buscarEmpleadoPorNombre(nombre) {
  // TODO: GET ${BASE_URL}/api/empleados?nombre=${nombre}&activo=true
  console.log(`[BDD] buscarEmpleado: "${nombre}"`);

  const resultado = MOCK_EMPLEADOS.filter(e =>
    e.nombre.toLowerCase().includes(nombre.toLowerCase())
  );

  return resultado.length > 0 ? resultado : null;
}

// ── USUARIOS WA ───────────────────────────────────────────────
async function getUsuarioWA(phone) {
  // TODO: GET ${BASE_URL}/api/wa/usuario?phone=${phone}
  console.log(`[BDD] getUsuarioWA: ${phone}`);
  return MOCK_USUARIOS_WA.get(phone) || null;
}

async function crearUsuarioWA(datos) {
  // TODO: POST ${BASE_URL}/api/wa/usuario
  console.log(`[BDD] crearUsuarioWA:`, datos);
  MOCK_USUARIOS_WA.set(datos.phone_number, {
    ...datos,
    id: `wa-${Date.now()}`,
    activo: true,
    created_at: new Date().toISOString(),
  });
  return MOCK_USUARIOS_WA.get(datos.phone_number);
}

module.exports = {
  buscarPrestacionPorNombre,
  buscarEmpleadoPorNombre,
  getUsuarioWA,
  crearUsuarioWA,
};
