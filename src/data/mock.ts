// Datos de ejemplo para la demo. Las fechas se calculan a partir de hoy para que
// siempre haya contratos por vencer, cobros pendientes y cobros en mora.
// Cuando exista el backend, este archivo se reemplaza por llamadas a la API.
import { calcularCobro, DIA_VENCIMIENTO_COBRO, hoy, parseISO, periodoActual, sumarMeses, toISO } from '../lib/negocio'
import type { Cobro, Consulta, Contrato, Propiedad, Propietario } from './types'

export interface DataState {
  propietarios: Propietario[]
  propiedades: Propiedad[]
  contratos: Contrato[]
  cobros: Cobro[]
  consultas: Consulta[]
}

const dias = (n: number) => {
  const d = hoy()
  d.setDate(d.getDate() + n)
  return toISO(d)
}
const meses = (n: number, dia = 1) => {
  const d = hoy()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  d.setDate(dia)
  return toISO(d)
}
const minISO = (a: string, b: string) => (a < b ? a : b)

const propietarios: Propietario[] = [
  { id: 'o1', nombre: 'Carlos Benítez', email: 'carlos.benitez@gmail.com', telefono: '351 455 1020', cbu: '0170099220000067812345' },
  { id: 'o2', nombre: 'Laura Fernández', email: 'laura.fernandez@gmail.com', telefono: '351 611 2233', cbu: '0110599520000012345678' },
  { id: 'o3', nombre: 'Grupo Norte SA', email: 'admin@gruponorte.com.ar', telefono: '351 422 9000', cbu: '0720000788000034567890' },
  { id: 'o4', nombre: 'Víctor Molina', email: 'vmolina@hotmail.com', telefono: '351 300 4455', cbu: '2850590940090418135201' },
  { id: 'o5', nombre: 'Sergio Paz', email: 'sergiopaz@gmail.com', telefono: '351 789 1122', cbu: '0140999801200012345671' },
  { id: 'o6', nombre: 'Fernanda Acosta', email: 'fer.acosta@gmail.com', telefono: '351 234 5678', cbu: '0070999030004012345678' },
]

type P = Omit<Propiedad, 'caracteristicas' | 'descripcion' | 'fotos' | 'creada'> & Partial<Pick<Propiedad, 'caracteristicas' | 'descripcion'>>
const prop = (p: P, i: number): Propiedad => ({
  caracteristicas: [],
  descripcion: '',
  fotos: [],
  creada: dias(-i * 9),
  ...p,
})

const propiedades: Propiedad[] = ([
  {
    id: 'p1', titulo: 'Departamento de 2 dormitorios con balcón', direccion: 'Rondeau 165, 4.º B', barrio: 'Nueva Córdoba', tipo: 'Departamento',
    operacion: 'Alquiler', estado: 'Alquilada', m2: 68, dormitorios: 2, banos: 1, alquiler: 520000, propietarioId: 'o1', ph: 'ph-a',
  },
  {
    id: 'p2', titulo: 'Casa con jardín y pileta', direccion: 'Av. Rafael Núñez 5200', barrio: 'Cerro de las Rosas', tipo: 'Casa',
    operacion: 'Venta', estado: 'En venta', m2: 210, dormitorios: 3, banos: 2, precioVenta: 185000, propietarioId: 'o2', ph: 'ph-d', destacada: true, etapaVenta: 'Oferta',
    descripcion: 'Tres dormitorios, galería y pileta. Lote de 450 m² en calle arbolada, ideal para una familia. Cochera doble y quincho.',
    caracteristicas: ['Pileta', 'Jardín', 'Galería', 'Quincho', 'Cochera doble', 'Calefacción central'],
  },
  {
    id: 'p3', titulo: 'Local comercial en esquina', direccion: 'Av. Sabattini 1450', barrio: 'General Paz', tipo: 'Local comercial',
    operacion: 'Alquiler', estado: 'Disponible', m2: 95, dormitorios: 0, banos: 1, alquiler: 1900000, propietarioId: 'o3', ph: 'ph-b', destacada: true,
    descripcion: 'Doble frente vidriado, sobre avenida de alto tránsito. Baño y depósito. Apto para distintos rubros comerciales.',
    caracteristicas: ['Doble frente', 'Vidriera', 'Depósito', 'Esquina', 'Persianas metálicas'],
  },
  {
    id: 'p4', titulo: 'Departamento a estrenar con cochera', direccion: 'Belgrano 900', barrio: 'Güemes', tipo: 'Departamento',
    operacion: 'Venta', estado: 'En venta', m2: 48, dormitorios: 1, banos: 1, precioVenta: 78000, propietarioId: 'o4', ph: 'ph-c', destacada: true, etapaVenta: 'Boleto',
    descripcion: 'Un dormitorio, terminaciones de primera y terraza común con vista. Cochera cubierta incluida.',
    caracteristicas: ['A estrenar', 'Cochera', 'Terraza común', 'Balcón', 'Apto crédito'],
  },
  {
    id: 'p5', titulo: 'PH reciclado con patio', direccion: 'Fragueiro 1500', barrio: 'Alta Córdoba', tipo: 'PH',
    operacion: 'Alquiler', estado: 'Disponible', m2: 82, dormitorios: 2, banos: 1, alquiler: 610000, propietarioId: 'o6', ph: 'ph-e',
    descripcion: 'PH al frente totalmente reciclado, con patio propio y lavadero. Sin expensas.',
    caracteristicas: ['Patio', 'Lavadero', 'Sin expensas', 'Apto mascotas'],
  },
  {
    id: 'p6', titulo: 'Lote en barrio cerrado', direccion: 'Lote 42, Manzana 7', barrio: 'Zona Norte', tipo: 'Lote',
    operacion: 'Venta', estado: 'En venta', m2: 600, dormitorios: 0, banos: 0, precioVenta: 42000, propietarioId: 'o5', ph: 'ph-c', etapaVenta: 'Captación',
    descripcion: 'Lote de 600 m² con todos los servicios, seguridad 24 h y amenities del barrio.',
    caracteristicas: ['Seguridad 24 h', 'Servicios', 'Amenities', 'Escriturable'],
  },
  {
    id: 'p7', titulo: 'Monoambiente amoblado', direccion: 'Obispo Trejo 300', barrio: 'Nueva Córdoba', tipo: 'Departamento',
    operacion: 'Alquiler', estado: 'Disponible', m2: 32, dormitorios: 0, banos: 1, alquiler: 390000, propietarioId: 'o2', ph: 'ph-a',
    descripcion: 'Monoambiente amoblado a metros de la Ciudad Universitaria. Ideal estudiantes.',
    caracteristicas: ['Amoblado', 'Portero', 'Ascensor', 'Cerca de la UNC'],
  },
  {
    id: 'p8', titulo: 'Casa 3 dormitorios', direccion: 'Pasaje Los Robles 220', barrio: 'Barrio Jardín', tipo: 'Casa',
    operacion: 'Alquiler', estado: 'Disponible', m2: 160, dormitorios: 3, banos: 2, alquiler: 880000, propietarioId: 'o3', ph: 'ph-d',
    descripcion: 'Casa en planta baja con patio, parrilla y cochera para un auto.',
    caracteristicas: ['Patio', 'Parrilla', 'Cochera', 'Dormitorio en suite'],
  },
  {
    id: 'p9', titulo: 'Oficina en torre céntrica', direccion: '27 de Abril 400, piso 9', barrio: 'Centro', tipo: 'Oficina',
    operacion: 'Venta', estado: 'En venta', m2: 70, dormitorios: 0, banos: 1, precioVenta: 96000, propietarioId: 'o4', ph: 'ph-b', etapaVenta: 'Tasación',
    descripcion: 'Oficina con vista a la Catedral, recepción y dos despachos. Edificio con seguridad.',
    caracteristicas: ['Vista abierta', 'Seguridad', 'Aire acondicionado', 'Ascensores'],
  },
  { id: 'p10', titulo: 'Depto. Av. Sabattini 2100', direccion: 'Av. Sabattini 2100, 2.º A', barrio: 'General Paz', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Alquilada', m2: 55, dormitorios: 1, banos: 1, alquiler: 455000, propietarioId: 'o1', ph: 'ph-d' },
  { id: 'p11', titulo: 'Local Jerónimo Luis de Cabrera 900', direccion: 'J. L. de Cabrera 900', barrio: 'Alta Córdoba', tipo: 'Local comercial', operacion: 'Alquiler', estado: 'Alquilada', m2: 120, dormitorios: 0, banos: 1, alquiler: 780000, propietarioId: 'o1', ph: 'ph-b' },
  { id: 'p12', titulo: 'Galpón zona industrial', direccion: 'Ruta 9 km 5', barrio: 'Zona Industrial', tipo: 'Galpón', operacion: 'Alquiler', estado: 'Suspendida', m2: 400, dormitorios: 0, banos: 1, alquiler: 1250000, propietarioId: 'o5', ph: 'ph-b' },
  { id: 'p13', titulo: 'Casa Los Álamos 87', direccion: 'Los Álamos 87', barrio: 'Villa Belgrano', tipo: 'Casa', operacion: 'Venta', estado: 'Vendida', m2: 180, dormitorios: 3, banos: 2, precioVenta: 120000, propietarioId: 'o6', ph: 'ph-d', etapaVenta: 'Escritura' },
  { id: 'p14', titulo: 'Casa 4 amb. Cerro de las Rosas', direccion: 'Av. Rafael Núñez 4800', barrio: 'Cerro de las Rosas', tipo: 'Casa', operacion: 'Alquiler', estado: 'Alquilada', m2: 190, dormitorios: 3, banos: 2, alquiler: 850000, propietarioId: 'o2', ph: 'ph-d' },
  { id: 'p15', titulo: 'Depto 3 amb. Güemes', direccion: 'Belgrano 640, 5.º A', barrio: 'Güemes', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Alquilada', m2: 75, dormitorios: 2, banos: 1, alquiler: 520000, propietarioId: 'o3', ph: 'ph-c' },
  { id: 'p16', titulo: 'Monoamb. Nueva Córdoba', direccion: 'Independencia 750, 2.º D', barrio: 'Nueva Córdoba', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Alquilada', m2: 30, dormitorios: 0, banos: 1, alquiler: 320000, propietarioId: 'o4', ph: 'ph-a' },
  { id: 'p17', titulo: 'Depto 1 amb. Cofico', direccion: 'Bv. Las Heras 120, 1.º B', barrio: 'Cofico', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Alquilada', m2: 36, dormitorios: 1, banos: 1, alquiler: 340000, propietarioId: 'o5', ph: 'ph-e' },
  { id: 'p18', titulo: 'Depto 2 amb. San Vicente', direccion: 'Agustín Garzón 1300', barrio: 'San Vicente', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Alquilada', m2: 52, dormitorios: 1, banos: 1, alquiler: 430000, propietarioId: 'o6', ph: 'ph-a' },
  { id: 'p19', titulo: 'Depto 3 amb. Alberdi', direccion: 'Colón 2400, 3.º C', barrio: 'Alberdi', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Alquilada', m2: 70, dormitorios: 2, banos: 1, alquiler: 470000, propietarioId: 'o2', ph: 'ph-c' },
  { id: 'p20', titulo: 'PH 3 amb. Barrio Jardín', direccion: 'Av. Richieri 2900', barrio: 'Barrio Jardín', tipo: 'PH', operacion: 'Alquiler', estado: 'Alquilada', m2: 90, dormitorios: 2, banos: 1, alquiler: 560000, propietarioId: 'o3', ph: 'ph-e' },
  { id: 'p21', titulo: 'Depto 1 amb. Pueyrredón', direccion: 'Bv. Los Andes 300', barrio: 'Pueyrredón', tipo: 'Departamento', operacion: 'Alquiler', estado: 'Disponible', m2: 34, dormitorios: 1, banos: 1, alquiler: 350000, propietarioId: 'o4', ph: 'ph-b' },
  { id: 'p22', titulo: 'PH 2 amb. Alta Córdoba', direccion: 'Fragueiro 1720', barrio: 'Alta Córdoba', tipo: 'PH', operacion: 'Alquiler', estado: 'Alquilada', m2: 60, dormitorios: 1, banos: 1, alquiler: 380000, propietarioId: 'o5', ph: 'ph-e' },
] as P[]).map(prop)

// Descripción completa para la propiedad del detalle de muestra
propiedades[0].descripcion =
  'Departamento luminoso en el corazón de Nueva Córdoba, a metros del Parque Sarmiento y de la Ciudad Universitaria. Living-comedor con salida a balcón al frente, cocina integrada con alacenas y dos dormitorios con placard.\n\nEdificio con portero, ascensor y terraza común. Requisitos: garantía propietaria o seguro de caución, y recibos de sueldo de los últimos 3 meses.'
propiedades[0].caracteristicas = ['Balcón al frente', 'Cocina integrada', 'Placard en dormitorios', 'Ascensor', 'Portero', 'Terraza común', 'Agua caliente central', 'Apto mascotas']

const servicios = (n: number) => ({
  nroMunicipalidad: String(11023456 + n * 3711),
  nroRentas: String(458721 + n * 913),
  nroAgua: String(3012345 + n * 517),
  nroLuz: String(7845120 + n * 281),
  nroGas: n % 4 === 3 ? '' : String(5021834 + n * 199),
})

type C = Pick<Contrato, 'id' | 'propiedadId' | 'inicio' | 'fin' | 'alquiler'> & { nombre: string; email: string } & Partial<Contrato>
const contrato = (c: C, i: number): Contrato => ({
  inquilino: { nombre: c.nombre, email: c.email },
  garantia: i % 3 === 1 ? 'Seguro de caución' : 'Garantía propietaria',
  finalizado: false,
  descripcion: '',
  proximoAumento: undefined,
  ...servicios(i),
  ...c,
})

const contratos: Contrato[] = ([
  { id: 'c1', nombre: 'Martín López', email: 'martin.lopez@gmail.com', propiedadId: 'p1', inicio: meses(-18), fin: meses(6, 0), alquiler: 520000, proximoAumento: dias(7) },
  { id: 'c2', nombre: 'Santiago Romero', email: 'santi.romero@outlook.com', propiedadId: 'p14', inicio: meses(-19, 15), fin: dias(20), alquiler: 850000 },
  { id: 'c3', nombre: 'Carolina Gómez', email: 'carogomez88@gmail.com', propiedadId: 'p15', inicio: meses(-16), fin: meses(8, 0), alquiler: 520000 },
  { id: 'c4', nombre: 'Federico Acosta', email: 'f.acosta@hotmail.com', propiedadId: 'p22', inicio: meses(-8, 10), fin: meses(16, 9), alquiler: 380000 },
  { id: 'c5', nombre: 'Lucía Fernández', email: 'lucia.fernandez@gmail.com', propiedadId: 'p16', inicio: meses(-23), fin: dias(6), alquiler: 320000 },
  { id: 'c6', nombre: 'Valentina Ruiz', email: 'vale.ruiz@gmail.com', propiedadId: 'p17', inicio: meses(-13), fin: meses(10, 0), alquiler: 340000 },
  { id: 'c7', nombre: 'Sofía Aguirre', email: 'sofia.aguirre@gmail.com', propiedadId: 'p18', inicio: meses(-6), fin: meses(18, 0), alquiler: 430000 },
  { id: 'c8', nombre: 'Florencia Castro', email: 'flor.castro@gmail.com', propiedadId: 'p19', inicio: meses(-10), fin: meses(14, 0), alquiler: 470000 },
  { id: 'c9', nombre: 'Lucas Morales', email: 'lucas.morales@gmail.com', propiedadId: 'p20', inicio: meses(-4), fin: meses(20, 0), alquiler: 560000 },
  { id: 'c10', nombre: 'Bruno Molina', email: 'bruno.molina@hotmail.com', propiedadId: 'p21', inicio: meses(-41), fin: meses(-17, 0), alquiler: 350000, finalizado: true },
  { id: 'c11', nombre: 'Carolina Ruiz', email: 'carolina.ruiz@gmail.com', propiedadId: 'p10', inicio: meses(-21), fin: meses(3, 0), alquiler: 455000 },
  { id: 'c12', nombre: 'Ríos Comercial SRL', email: 'administracion@rioscomercial.com', propiedadId: 'p11', inicio: meses(-4), fin: meses(20, 0), alquiler: 780000 },
] as C[]).map(contrato)

// ---------- Cobros ----------
let recibo = 780
const pagar = (c: Cobro, fechaPago: string, forma: 'Transferencia' | 'Efectivo' = 'Transferencia'): Cobro => {
  const diasMora = Math.max(0, Math.round((parseISO(fechaPago).getTime() - parseISO(c.vencimiento).getTime()) / 86_400_000))
  const calc = calcularCobro(c.alquiler, diasMora)
  const t = parseISO(fechaPago)
  t.setDate(t.getDate() + 3)
  return {
    ...c,
    pago: { fecha: fechaPago, forma, diasMora, ...calc, recibo: `0001-${String(++recibo).padStart(5, '0')}`, transferidoPropietario: toISO(t) },
  }
}

const cobros: Cobro[] = []
const actual = periodoActual()
const venceDelMes = (periodo: string) => `${periodo}-${String(DIA_VENCIMIENTO_COBRO).padStart(2, '0')}`

// Historial de los últimos 6 meses
for (const c of contratos.filter((x) => !x.finalizado)) {
  for (let k = 6; k >= 1; k--) {
    const periodo = sumarMeses(actual, -k)
    if (periodo < c.inicio.slice(0, 7)) continue
    const base: Cobro = { id: `${c.id}-${periodo}`, contratoId: c.id, periodo, vencimiento: venceDelMes(periodo), alquiler: c.alquiler }
    const atraso = c.id === 'c1' && k === 2 ? 6 : c.id === 'c6' && k === 1 ? 4 : 0
    const d = parseISO(base.vencimiento)
    d.setDate(d.getDate() - 2 + atraso + (k % 3))
    cobros.push(pagar(base, toISO(d), k % 2 ? 'Transferencia' : 'Efectivo'))
  }
}

// Período actual: algunos pagados, pendientes y en mora
const hoyISO = toISO(hoy())
const estadoActual: Record<string, 'pagado' | 'recargo' | 'pendiente' | 'mora'> = {
  c1: 'pagado', c2: 'pendiente', c3: 'pagado', c4: 'pagado', c5: 'pagado', c6: 'mora',
  c7: 'pagado', c8: 'recargo', c9: 'pendiente', c11: 'mora', c12: 'pagado',
}
for (const c of contratos.filter((x) => !x.finalizado)) {
  const e = estadoActual[c.id]
  const vencimiento = e === 'pendiente' ? dias(3) : e === 'mora' ? dias(-13) : minISO(venceDelMes(actual), dias(-6))
  const base: Cobro = { id: `${c.id}-${actual}`, contratoId: c.id, periodo: actual, vencimiento, alquiler: c.alquiler }
  if (e === 'pagado') {
    const d = parseISO(vencimiento)
    d.setDate(d.getDate() - 2)
    cobros.push(pagar(base, minISO(toISO(d), hoyISO)))
  } else if (e === 'recargo') {
    const d = parseISO(vencimiento)
    d.setDate(d.getDate() + 5)
    cobros.push(pagar(base, minISO(toISO(d), hoyISO), 'Efectivo'))
  } else {
    cobros.push(base)
  }
}

const hora = (diasAtras: number, h: string) => `${dias(-diasAtras)}T${h}:00`

const consultas: Consulta[] = [
  { id: 'q1', nombre: 'Alejandra Gómez', email: 'ale.gomez@gmail.com', telefono: '351 456 7890', propiedadId: 'p2', mensaje: 'Hola, me interesa la casa de Cerro de las Rosas. ¿Podríamos coordinar una visita para este sábado?', fecha: hora(0, '10:42'), estado: 'Nueva' },
  { id: 'q2', nombre: 'Federico Sosa', email: 'fsosa@mail.com', telefono: '351 612 3344', propiedadId: 'p4', mensaje: '¿El precio es negociable? ¿Aceptan crédito hipotecario?', fecha: hora(0, '09:15'), estado: 'Nueva' },
  { id: 'q3', nombre: 'Valeria Ortiz', email: 'vale.ortiz@mail.com', telefono: '351 778 9012', propiedadId: 'p7', mensaje: 'Soy estudiante, ¿qué requisitos piden para la garantía? ¿Sirve seguro de caución?', fecha: hora(1, '18:30'), estado: 'Respondida' },
  { id: 'q4', nombre: 'Diego Ramírez', email: 'dramirez@mail.com', telefono: '351 334 5566', propiedadId: 'p3', mensaje: 'Quiero saber si el local tiene habilitación comercial para gastronomía.', fecha: hora(5, '11:05'), estado: 'Cerrada' },
]

export const datosIniciales = (): DataState => structuredClone({ propietarios, propiedades, contratos, cobros, consultas })

// Usuarios de la demo (contraseña para todos: futura2026)
export const usuariosDemo = [
  { email: 'diana@futura.com.ar', nombre: 'Diana Lazarte', rol: 'duena' as const },
  { email: 'secretaria@futura.com.ar', nombre: 'Secretaría', rol: 'secretaria' as const },
  { email: 'martin.lopez@gmail.com', nombre: 'Martín López', rol: 'inquilino' as const, refId: 'c1' },
  { email: 'carlos.benitez@gmail.com', nombre: 'Carlos Benítez', rol: 'propietario' as const, refId: 'o1' },
]
export const PASSWORD_DEMO = 'futura2026'