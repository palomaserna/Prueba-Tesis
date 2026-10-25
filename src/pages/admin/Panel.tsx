// RF-11: dashboard con KPIs (solo la Dueña, RNF-01) + RF-05 alertas.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon'
import { Lines } from '../../components/ui'
import { fecha, fechaLarga, nombreMes, periodoLargo, pesos, pesosCorto } from '../../lib/format'
import { ETAPAS_VENTA } from '../../data/types'
import { COMISION_VENTA, diasDeMora, diasParaVencer, estadoCobro, estadoContrato, periodoActual, sumarMeses } from '../../lib/negocio'
import { useAuth } from '../../store/AuthContext'
import { useData } from '../../store/DataContext'

interface Alerta { t: string; d: string; tone: 'danger' | 'warn' | 'info'; icon: IconName; to: string }

export default function Panel() {
  const { usuario } = useAuth()
  const { propiedades, contratos, cobros, consultas } = useData()
  const actual = periodoActual()
  const periodos = Array.from({ length: 6 }, (_, k) => sumarMeses(actual, k - 5))
  const [periodo, setPeriodo] = useState(actual)
  const esDuena = usuario?.rol === 'duena'

  const datos = useMemo(() => {
    const delMes = cobros.filter((c) => c.periodo === periodo)
    const pagados = delMes.filter((c) => c.pago)
    const mora = delMes.filter((c) => estadoCobro(c) === 'En mora')
    const pendientes = delMes.filter((c) => estadoCobro(c) === 'Pendiente')
    const enAlquiler = propiedades.filter((p) => p.operacion === 'Alquiler' && (p.estado === 'Alquilada' || p.estado === 'Disponible'))
    const ocupadas = enAlquiler.filter((p) => p.estado === 'Alquilada').length
    const ingresos = pagados.reduce((s, c) => s + c.pago!.comision, 0)
    const esperado = delMes.reduce((s, c) => s + Math.round(c.alquiler * 0.1), 0)
    const porVencer = contratos.filter((c) => estadoContrato(c) === 'Por vencer')
    const barras = periodos.map((p) => ({
      p,
      v: cobros.filter((c) => c.periodo === p && c.pago).reduce((s, c) => s + c.pago!.comision, 0),
    }))
    return { delMes, pagados, mora, pendientes, enAlquiler, ocupadas, ingresos, esperado, porVencer, barras }
  }, [cobros, propiedades, contratos, periodo, periodos])

  const prop = (id: string) => propiedades.find((p) => p.id === id)
  const contrato = (id: string) => contratos.find((c) => c.id === id)

  const alertas: Alerta[] = [
    ...cobros.filter((c) => estadoCobro(c) === 'En mora').map((c) => {
      const k = contrato(c.contratoId)
      return { t: `Cobro en mora · ${k?.inquilino.nombre}`, d: `${prop(k?.propiedadId ?? '')?.titulo} · ${diasDeMora(c)} días de atraso`, tone: 'danger' as const, icon: 'alert' as const, to: `/admin/cobros?registrar=${c.id}` }
    }),
    ...datos.porVencer.sort((a, b) => a.fin.localeCompare(b.fin)).map((c) => ({
      t: `Contrato vence en ${diasParaVencer(c)} días`, d: `${c.inquilino.nombre} · ${prop(c.propiedadId)?.titulo} · ${fecha(c.fin)}`, tone: 'warn' as const, icon: 'calendar' as const, to: `/admin/contratos?editar=${c.id}`,
    })),
    ...(() => {
      const nuevas = consultas.filter((q) => q.estado === 'Nueva')
      return nuevas.length
        ? [{ t: `${nuevas.length} ${nuevas.length === 1 ? 'consulta nueva' : 'consultas nuevas'} del catálogo`, d: nuevas.map((q) => prop(q.propiedadId ?? '')?.titulo ?? q.motivo ?? 'Consulta general').slice(0, 2).join(' · '), tone: 'info' as const, icon: 'message' as const, to: '/admin/consultas' }]
        : []
    })(),
  ]

  const max = Math.max(...datos.barras.map((b) => b.v), 1) * 1.1
  const acumulado = datos.barras.reduce((s, b) => s + b.v, 0)
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0)
  const ocupacion = pct(datos.ocupadas, datos.enAlquiler.length)
  const indiceMora = pct(datos.mora.length, datos.delMes.length)
  const hora = new Date().getHours()
  const saludo = hora < 13 ? 'Buen día' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'
  const primerNombre = usuario?.nombre.split(' ')[0] ?? ''
  const mesNombre = nombreMes(periodo).toLowerCase()

  const kpis = [
    { label: 'Ocupación', v: String(ocupacion).replace('.', ','), suf: '%', sub: `${datos.ocupadas} de ${datos.enAlquiler.length} propiedades en alquiler ocupadas`, pct: ocupacion, bar: 'var(--navy)' },
    { label: 'Índice de mora', v: String(indiceMora).replace('.', ','), suf: '%', sub: `${datos.mora.length} de ${datos.delMes.length} cobros vencidos sin pagar`, pct: indiceMora, bar: 'var(--mora)' },
    { label: 'Ingresos del mes', v: pesosCorto(datos.ingresos).replace(' M', ''), suf: datos.ingresos >= 1e6 ? 'M' : '', sub: `de ${pesosCorto(datos.esperado)} esperados en comisiones`, pct: pct(datos.ingresos, datos.esperado), bar: 'var(--gold)' },
    { label: 'Por vencer', v: String(datos.porVencer.length), suf: '', sub: 'contratos en los próximos 30 días', pct: pct(datos.porVencer.length, contratos.length), bar: 'var(--navy)' },
  ]

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <div className="between" style={{ marginBottom: 36 }}>
        <div>
          <p className="eyebrow line fz-in">{fechaLarga()}</p>
          <h1 className="h1"><Lines lines={[<>{saludo}, <span className="gold">{primerNombre}</span></>]} /></h1>
          <p className="fz-in" style={{ margin: '10px 0 0', fontSize: 16, color: 'var(--text-2)', animationDelay: '.1s' }}>
            {esDuena ? `Resumen general de las operaciones de ${mesNombre}.` : 'Tareas del día: cobros, vencimientos y consultas.'}
          </p>
        </div>
        {esDuena && (
          <label className="select-inline fz-in" style={{ background: '#fff', animationDelay: '.15s' }}>Período
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {[...periodos].reverse().map((p) => <option key={p} value={p}>{periodoLargo(p)}</option>)}
            </select>
          </label>
        )}
      </div>

      {esDuena && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0 28px', marginBottom: 40 }}>
          {kpis.map((k, idx) => (
            <div key={k.label} className="fz-in" style={{ padding: '26px 0', borderTop: '1px solid var(--line)', animationDelay: `${0.1 + idx * 0.06}s` }}>
              <div className="label-caps" style={{ fontSize: 13, marginBottom: 12 }}>{k.label}</div>
              <div style={{ fontSize: 'clamp(44px, 4.2vw, 60px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>{k.v}<span className="gold">{k.suf}</span></div>
              <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 4, overflow: 'hidden', margin: '16px 0 10px', maxWidth: 220 }}>
                <div className="fz-grow" style={{ height: 4, width: `${Math.min(100, k.pct)}%`, background: k.bar }} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{k.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="row" style={{ marginBottom: 20 }}>
        {esDuena && (
          <section className="card fz-in" aria-label="Ingresos por administración" style={{ flex: '3 1 480px', minWidth: 0, animationDelay: '.35s' }}>
            <div className="between" style={{ marginBottom: 22, alignItems: 'flex-start', gap: 10 }}>
              <div>
                <h2 className="h3">Ingresos por <span className="gold">administración</span></h2>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--muted)' }}>Comisión del 10 % sobre alquileres cobrados · últimos 6 meses</p>
              </div>
              <div style={{ textAlign: 'right' }}><div className="label-caps">Acumulado</div><div style={{ fontSize: 24, fontWeight: 800 }}>{pesos(acumulado)}</div></div>
            </div>
            <div role="img" aria-label={`Ingresos mensuales: ${datos.barras.map((b) => `${nombreMes(b.p)} ${pesos(b.v)}`).join(', ')}`}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(8px, 2vw, 24px)', height: 230, paddingTop: 24, borderBottom: '1px solid var(--line)', backgroundImage: 'linear-gradient(#EEEEEA 1px, transparent 1px)', backgroundSize: '100% 57px' }}>
              {datos.barras.map((b, idx) => (
                <div key={b.p} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{pesosCorto(b.v).replace('$', '')}</span>
                  <div className="fz-bar" style={{ width: '100%', maxWidth: 60, height: `${(b.v / max) * 100}%`, minHeight: 4, background: b.p === periodo ? 'var(--gold)' : 'var(--navy)', borderRadius: '12px 12px 4px 4px', animationDelay: `${0.4 + idx * 0.08}s` }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 24px)', paddingTop: 10 }}>
              {datos.barras.map((b) => <span key={b.p} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>{nombreMes(b.p).slice(0, 3)}</span>)}
            </div>
          </section>
        )}

        <section className="card fz-in" aria-label="Alertas" style={{ flex: '2 1 360px', minWidth: 0, animationDelay: '.42s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 className="h3">Alertas</h2>
            {alertas.length > 0 && <span className="badge b-navy">{alertas.length} {alertas.length === 1 ? 'nueva' : 'nuevas'}</span>}
          </div>
          {alertas.length === 0 && <p className="muted" style={{ margin: '20px 0' }}>Todo al día. No hay cobros en mora ni contratos por vencer.</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {alertas.map((a, k) => (
              <li key={k}>
                <Link to={a.to} style={{ display: 'flex', gap: 14, padding: '14px 10px', borderRadius: 12, borderBottom: '1px solid #F0F0EC' }} className="alert-row">
                  <span className="avatar" style={{ flexBasis: 38, width: 38, height: 38, background: a.tone === 'danger' ? 'var(--danger-bg)' : a.tone === 'warn' ? 'var(--warn-bg)' : 'var(--info-bg)' }}>
                    <Icon name={a.icon} size={16} stroke={a.tone === 'danger' ? '#8A3415' : a.tone === 'warn' ? '#6E5320' : '#0F1E3A'} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{a.t}</span>
                    <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{a.d}</span>
                  </span>
                  <span className="avatar" style={{ alignSelf: 'center', flexBasis: 36, width: 36, height: 36 }}><Icon name="arrowUpRight" size={14} width={2.2} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="row">
        <section className="card fz-in" aria-label="Cobros del mes" style={{ flex: '1 1 420px', minWidth: 0, animationDelay: '.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, gap: 12 }}>
            <h2 className="h3">Cobros de <span className="gold">{mesNombre}</span></h2>
            <Link to="/admin/cobros" className="link-underline">Ir a cobros</Link>
          </div>
          <div role="img" aria-label={`${datos.pagados.length} pagados, ${datos.pendientes.length} pendientes, ${datos.mora.length} en mora`} style={{ display: 'flex', height: 14, borderRadius: 8, overflow: 'hidden', gap: 3 }}>
            <div className="fz-grow" style={{ flex: datos.pagados.length, background: 'var(--navy)' }} />
            <div className="fz-grow" style={{ flex: datos.pendientes.length, background: 'var(--gold-soft)' }} />
            <div className="fz-grow" style={{ flex: datos.mora.length, background: 'var(--mora)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 20 }}>
            {[['Pagados', datos.pagados.length, 'var(--navy)'], ['Pendientes', datos.pendientes.length, 'var(--gold-soft)'], ['En mora', datos.mora.length, 'var(--mora)']].map(([l, v, c]) => (
              <div key={l as string}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c as string }} />{l}</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{v}</div>
              </div>
            ))}
          </div>
        </section>

        {esDuena && <Compraventas />}
      </div>
    </main>
  )
}

/** RF-10: resumen del proceso de compraventa (etapas y comisión del 5 %). */
function Compraventas() {
  const { propiedades } = useData()
  const vendidas = propiedades.filter((p) => p.estado === 'Vendida')
  const comisiones = vendidas.reduce((s, p) => s + (p.precioVenta ?? 0) * COMISION_VENTA, 0)
  const pipe = ETAPAS_VENTA.map((s) => ({
    s,
    n: propiedades.filter((p) => p.operacion === 'Venta' && (p.etapaVenta ?? 'Captación') === s && (p.estado === 'En venta' || s === 'Escritura')).length,
  }))
  return (
    <section className="card dark fz-in" aria-label="Compraventas" style={{ flex: '1 1 420px', minWidth: 0, animationDelay: '.56s' }}>
      <svg aria-hidden="true" viewBox="0 0 200 200" style={{ position: 'absolute', right: -40, bottom: -60, width: 260, height: 260, opacity: 0.08 }}>
        <g fill="none" stroke="#E2C68F" strokeWidth="3"><path d="M20 100 L100 30 L180 100" /><path d="M40 85 V180 H160 V85" /><path d="M80 180 V130 H120 V180" /></g>
      </svg>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <h2 className="h3">Compraventas <span style={{ color: 'var(--gold-light)' }}>{new Date().getFullYear()}</span></h2>
          <span style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#C9D1DE' }}>Comisión 5 %</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 22 }}>
          <div><div style={{ fontSize: 13, color: '#C9D1DE' }}>Cerradas</div><div style={{ fontSize: 36, fontWeight: 800 }}>{vendidas.length}</div></div>
          <div><div style={{ fontSize: 13, color: '#C9D1DE' }}>Comisiones</div><div style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold-light)' }}>USD {Math.round(comisiones).toLocaleString('es-AR')}</div></div>
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6, fontSize: 12, textAlign: 'center' }}>
          {pipe.map((p) => (
            <li key={p.s} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '12px 4px' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{p.n}</div><div style={{ color: '#C9D1DE', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.s}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
