// Estado de la aplicación (propiedades, contratos, cobros, consultas).
// Hoy guarda en localStorage para la demo; cada acción es el punto donde
// después se llama a la API (por ejemplo supabase.from('cobros').update(...)).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { datosIniciales, type DataState } from '../data/mock'
import type { Cobro, Consulta, Contrato, EstadoConsulta, FormaPago, Propiedad } from '../data/types'
import { calcularCobro, DIA_VENCIMIENTO_COBRO, diasDeMora, parseISO, periodoActual } from '../lib/negocio'

const KEY = 'futura-demo-v1'

function cargar(): DataState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DataState
  } catch {
    /* sin almacenamiento: usamos los datos de ejemplo */
  }
  return datosIniciales()
}

const nuevoId = (prefijo: string) => `${prefijo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

interface DataApi extends DataState {
  guardarPropiedad: (p: Omit<Propiedad, 'id' | 'creada'> & { id?: string }) => Propiedad
  eliminarPropiedad: (id: string) => void
  guardarContrato: (c: Omit<Contrato, 'id'> & { id?: string }) => Contrato
  eliminarContrato: (id: string) => void
  registrarPago: (cobroId: string, datos: { fecha: string; forma: FormaPago; diasMora?: number }) => Cobro
  enviarConsulta: (c: Omit<Consulta, 'id' | 'fecha' | 'estado'>) => void
  cambiarEstadoConsulta: (id: string, estado: EstadoConsulta) => void
  restablecer: () => void
}

const Ctx = createContext<DataApi | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(cargar)
  const ref = useRef(state)

  useEffect(() => {
    ref.current = state
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* modo privado o almacenamiento lleno */
    }
  }, [state])

  const guardarPropiedad: DataApi['guardarPropiedad'] = useCallback((p) => {
    const final: Propiedad = { creada: new Date().toISOString(), ...p, id: p.id ?? nuevoId('p') } as Propiedad
    setState((s) => ({
      ...s,
      propiedades: p.id
        ? s.propiedades.map((x) => (x.id === p.id ? { ...x, ...final, creada: x.creada } : x))
        : [final, ...s.propiedades],
    }))
    return final
  }, [])

  const eliminarPropiedad = useCallback((id: string) => {
    setState((s) => ({ ...s, propiedades: s.propiedades.filter((x) => x.id !== id) }))
  }, [])

  const guardarContrato: DataApi['guardarContrato'] = useCallback((c) => {
    const final: Contrato = { ...c, id: c.id ?? nuevoId('c') }
    setState((s) => {
      const existe = s.contratos.some((x) => x.id === final.id)
      const contratos = existe ? s.contratos.map((x) => (x.id === final.id ? final : x)) : [final, ...s.contratos]
      // RF-02: la propiedad pasa a "Alquilada"; si el contrato se rescinde, vuelve a "Disponible"
      const propiedades = s.propiedades.map((p) => {
        if (p.id !== final.propiedadId) return p
        if (!final.finalizado) return { ...p, estado: 'Alquilada' as const, alquiler: final.alquiler }
        return p.estado === 'Alquilada' ? { ...p, estado: 'Disponible' as const } : p
      })
      // Alta: se genera el cobro del período actual
      const periodo = periodoActual()
      let cobros = s.cobros
      if (!existe && !final.finalizado && final.inicio.slice(0, 7) <= periodo) {
        cobros = [
          ...cobros,
          { id: `${final.id}-${periodo}`, contratoId: final.id, periodo, vencimiento: `${periodo}-${String(DIA_VENCIMIENTO_COBRO).padStart(2, '0')}`, alquiler: final.alquiler },
        ]
      }
      // Edición: el cobro sin pagar del mes toma el nuevo monto
      if (existe) {
        cobros = cobros.map((x) => (x.contratoId === final.id && !x.pago ? { ...x, alquiler: final.alquiler } : x))
      }
      return { ...s, contratos, propiedades, cobros }
    })
    return final
  }, [])

  const eliminarContrato = useCallback((id: string) => {
    setState((s) => {
      const c = s.contratos.find((x) => x.id === id)
      return {
        ...s,
        contratos: s.contratos.filter((x) => x.id !== id),
        cobros: s.cobros.filter((x) => x.contratoId !== id),
        propiedades: s.propiedades.map((p) => (c && p.id === c.propiedadId && p.estado === 'Alquilada' ? { ...p, estado: 'Disponible' as const } : p)),
      }
    })
  }, [])

  const registrarPago: DataApi['registrarPago'] = useCallback((cobroId, { fecha, forma, diasMora }) => {
    const s = ref.current
    const c = s.cobros.find((x) => x.id === cobroId)
    if (!c) throw new Error('No existe el cobro.')
    // RF-06: no se registra dos veces el mismo período
    if (c.pago) throw new Error('Este período ya fue registrado como pagado.')
    const dm = diasMora ?? diasDeMora(c, parseISO(fecha))
    const recibos = s.cobros.filter((x) => x.pago).length
    const actualizado: Cobro = {
      ...c,
      pago: { fecha, forma, diasMora: dm, ...calcularCobro(c.alquiler, dm), recibo: `0001-${String(800 + recibos + 1).padStart(5, '0')}` },
    }
    const next = { ...s, cobros: s.cobros.map((x) => (x.id === cobroId ? actualizado : x)) }
    ref.current = next
    setState(next)
    return actualizado
  }, [])

  const enviarConsulta: DataApi['enviarConsulta'] = useCallback((c) => {
    setState((s) => ({
      ...s,
      consultas: [{ ...c, id: nuevoId('q'), fecha: new Date().toISOString().slice(0, 19), estado: 'Nueva' }, ...s.consultas],
    }))
  }, [])

  const cambiarEstadoConsulta = useCallback((id: string, estado: EstadoConsulta) => {
    setState((s) => ({ ...s, consultas: s.consultas.map((q) => (q.id === id ? { ...q, estado } : q)) }))
  }, [])

  const restablecer = useCallback(() => setState(datosIniciales()), [])

  const api = useMemo<DataApi>(
    () => ({ ...state, guardarPropiedad, eliminarPropiedad, guardarContrato, eliminarContrato, registrarPago, enviarConsulta, cambiarEstadoConsulta, restablecer }),
    [state, guardarPropiedad, eliminarPropiedad, guardarContrato, eliminarContrato, registrarPago, enviarConsulta, cambiarEstadoConsulta, restablecer],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData debe usarse dentro de <DataProvider>')
  return v
}
