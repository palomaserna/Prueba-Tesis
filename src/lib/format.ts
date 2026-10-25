import { parseISO } from './negocio'

const ars = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

export const pesos = (n: number) => '$' + ars.format(Math.round(n))
export const dolares = (n: number) => 'USD ' + ars.format(Math.round(n))

/** $3.920.000 → "$3,92 M" */
export const pesosCorto = (n: number) =>
  n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(2).replace('.', ',') + ' M' : pesos(n)

export const fecha = (iso?: string) => {
  if (!iso) return '—'
  const d = parseISO(iso.slice(0, 10))
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export const nombreMes = (periodo: string) => MESES[Number(periodo.slice(5, 7)) - 1]
export const periodoLargo = (periodo: string) => `${nombreMes(periodo)} ${periodo.slice(0, 4)}`
export const periodoCorto = (periodo: string) => `${nombreMes(periodo).slice(0, 3)}. ${periodo.slice(0, 4)}`

export const fechaLarga = (d = new Date()) => {
  const s = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const iniciales = (nombre: string) =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const precioPropiedad = (p: { operacion: string; alquiler?: number; precioVenta?: number }) =>
  p.operacion === 'Venta' ? dolares(p.precioVenta ?? 0) : pesos(p.alquiler ?? 0)

export const WHATSAPP = '5493515459999'
export const whatsappLink = (texto: string, numero = WHATSAPP) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
