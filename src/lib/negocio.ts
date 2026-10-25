// Reglas de negocio de Futura (RF-05, RF-07, RF-08, RF-09, RF-10).
import type { Cobro, Contrato, EstadoCobro, EstadoContrato } from '../data/types'

export const COMISION_ALQUILER = 0.10 // RF-07
export const COMISION_VENTA = 0.05 // RF-10
export const RECARGO_DIARIO = 0.002 // 0,2 % diario sobre el alquiler (cláusula del contrato)
export const DIAS_AVISO_VENCIMIENTO = 30 // RF-05
export const DIA_VENCIMIENTO_COBRO = 10

const DAY = 86_400_000

export function hoy(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d || 1)
}

export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY)
}

export function periodoActual(): string {
  return toISO(hoy()).slice(0, 7)
}

export function sumarMeses(periodo: string, n: number): string {
  const d = parseISO(periodo + '-01')
  d.setMonth(d.getMonth() + n)
  return toISO(d).slice(0, 7)
}

/** RF-05: "Por vencer" cuando faltan 30 días o menos. */
export function estadoContrato(c: Contrato, ref = hoy()): EstadoContrato {
  if (c.finalizado) return 'Finalizado'
  const dias = diasEntre(ref, parseISO(c.fin))
  if (dias < 0) return 'Finalizado'
  if (dias <= DIAS_AVISO_VENCIMIENTO) return 'Por vencer'
  return 'Activo'
}

export function diasParaVencer(c: Contrato, ref = hoy()): number {
  return diasEntre(ref, parseISO(c.fin))
}

/** RF-08: un cobro sin pagar pasa a "En mora" al vencer el plazo. */
export function estadoCobro(c: Cobro, ref = hoy()): EstadoCobro {
  if (c.pago) return c.pago.diasMora > 0 ? 'Pago c/ recargo' : 'Pagado'
  return diasEntre(parseISO(c.vencimiento), ref) > 0 ? 'En mora' : 'Pendiente'
}

export function diasDeMora(c: Cobro, fechaPago = hoy()): number {
  return Math.max(0, diasEntre(parseISO(c.vencimiento), fechaPago))
}

/** RF-07 / RF-09: cálculo automático de recargo, comisión y neto al propietario. */
export function calcularCobro(alquiler: number, diasMora: number) {
  const recargo = Math.round(alquiler * RECARGO_DIARIO * diasMora)
  const total = alquiler + recargo
  const comision = Math.round(alquiler * COMISION_ALQUILER)
  return { recargo, total, comision, neto: total - comision }
}
