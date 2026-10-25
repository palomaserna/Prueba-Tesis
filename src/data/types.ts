// Modelo de datos del frontend. Refleja el diagrama de clases y está listo
// para reemplazar los datos de ejemplo por la API (Supabase / NestJS).

export type Placeholder = 'ph-a' | 'ph-b' | 'ph-c' | 'ph-d' | 'ph-e'

export type TipoPropiedad = 'Departamento' | 'Casa' | 'PH' | 'Local comercial' | 'Oficina' | 'Lote' | 'Galpón'
export type Operacion = 'Alquiler' | 'Venta'
// RF-02: ciclo de vida de la propiedad
export type EstadoPropiedad = 'Disponible' | 'Alquilada' | 'En venta' | 'Suspendida' | 'Vendida'

export interface Propietario {
  id: string
  nombre: string
  email: string
  telefono: string
  cbu: string // 22 dígitos: siempre string
}

export interface Propiedad {
  id: string
  titulo: string
  direccion: string
  barrio: string
  tipo: TipoPropiedad
  operacion: Operacion
  estado: EstadoPropiedad
  m2: number
  dormitorios: number
  banos: number
  alquiler?: number // ARS por mes
  precioVenta?: number // USD
  propietarioId: string
  descripcion: string
  caracteristicas: string[]
  ph: Placeholder
  fotos: string[] // URLs (Supabase Storage); vacías = foto de muestra
  destacada?: boolean
  etapaVenta?: EtapaVenta // RF-10, solo para operaciones de venta
  creada: string // ISO
}

export const ETAPAS_VENTA = ['Captación', 'Tasación', 'Oferta', 'Boleto', 'Escritura'] as const
export type EtapaVenta = (typeof ETAPAS_VENTA)[number]

export type EstadoContrato = 'Activo' | 'Por vencer' | 'Finalizado'
export type Garantia = 'Garantía propietaria' | 'Seguro de caución'

export interface Contrato {
  id: string
  inquilino: { nombre: string; email: string; telefono?: string }
  propiedadId: string
  inicio: string // YYYY-MM-DD
  fin: string
  proximoAumento?: string
  alquiler: number
  garantia: Garantia
  finalizado: boolean // rescindido o terminado manualmente
  nroMunicipalidad: string
  nroRentas: string
  nroAgua: string
  nroLuz: string
  nroGas: string
  descripcion: string
}

export type EstadoCobro = 'Pendiente' | 'Pagado' | 'En mora' | 'Pago c/ recargo'
export type FormaPago = 'Transferencia' | 'Efectivo'

export interface Cobro {
  id: string
  contratoId: string
  periodo: string // YYYY-MM
  vencimiento: string // YYYY-MM-DD
  alquiler: number
  pago?: {
    fecha: string
    forma: FormaPago
    diasMora: number
    recargo: number
    total: number
    comision: number
    neto: number
    recibo: string
    transferidoPropietario?: string
  }
}

export type EstadoConsulta = 'Nueva' | 'Respondida' | 'Cerrada'

export interface Consulta {
  id: string
  nombre: string
  email: string
  telefono: string
  motivo?: string
  propiedadId?: string
  mensaje: string
  fecha: string // ISO con hora
  estado: EstadoConsulta
}

export type Rol = 'duena' | 'secretaria' | 'inquilino' | 'propietario'

export interface Usuario {
  email: string
  nombre: string
  rol: Rol
  refId?: string // propietarioId o contratoId según el rol
}
