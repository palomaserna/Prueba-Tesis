// RF-12: el propietario consulta sus propiedades, si el alquiler se cobró y sus liquidaciones.
import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Lines, Photo, Roll } from '../../components/ui'
import type { Cobro } from '../../data/types'
import { fecha, periodoCorto, periodoLargo, pesos } from '../../lib/format'
import { diasDeMora, estadoCobro, estadoContrato, periodoActual } from '../../lib/negocio'
import { useAuth } from '../../store/AuthContext'
import { useData } from '../../store/DataContext'

export default function PortalPropietario() {
  const { usuario } = useAuth()
  const { propiedades, contratos, cobros, propietarios } = useData()
  const [sel, setSel] = useState(0)
  const owner = propietarios.find((o) => o.id === usuario?.refId)
  const actual = periodoActual()

  const mias = propiedades
    .filter((p) => p.propietarioId === owner?.id)
    .map((p) => {
      const c = contratos.find((k) => k.propiedadId === p.id && estadoContrato(k) !== 'Finalizado')
      const cobro = c && cobros.find((x) => x.contratoId === c.id && x.periodo === actual)
      return { p, c, cobro }
    })
    .filter((x) => x.c)

  const delMes = mias.map((m) => m.cobro).filter(Boolean) as Cobro[]
  const cobrado = delMes.filter((c) => c.pago).reduce((s, c) => s + c.pago!.total, 0)
  const neto = delMes.filter((c) => c.pago).reduce((s, c) => s + c.pago!.neto, 0)
  const hist = cobros
    .filter((c) => c.pago && mias.some((m) => m.c!.id === c.contratoId))
    .sort((a, b) => b.periodo.localeCompare(a.periodo))
    .slice(0, 8)
  const s = mias[Math.min(sel, mias.length - 1)]

  const descargar = (c: Cobro) => {
    const m = mias.find((x) => x.c!.id === c.contratoId)!
    const txt = [
      'FUTURA SERVICIOS INMOBILIARIOS — LIQUIDACIÓN', '',
      `Propietario: ${owner?.nombre}`, `Propiedad: ${m.p.titulo} (${m.p.direccion})`, `Período: ${periodoLargo(c.periodo)}`, '',
      `Alquiler cobrado: ${pesos(c.pago!.total)}`, `Comisión administración (10 %): -${pesos(c.pago!.comision)}`, 'Gastos de gestión: $0',
      `NETO A COBRAR: ${pesos(c.pago!.neto)}`, '', `Recibo N.° ${c.pago!.recibo} · Cobrado el ${fecha(c.pago!.fecha)}`,
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }))
    a.download = `liquidacion-${c.periodo}-${m.p.id}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="between" style={{ marginBottom: 36, gap: 24 }}>
        <div>
          <p className="eyebrow fz-in" style={{ marginBottom: 10 }}>{periodoLargo(actual)}</p>
          <h1 style={{ margin: 0, fontSize: 'clamp(34px, 3.8vw, 52px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.06 }}>
            <Lines lines={[<>Hola, <span className="gold">{owner?.nombre.split(' ')[0]}</span></>]} />
          </h1>
        </div>
        <dl className="fz-in" style={{ margin: 0, display: 'flex', flexWrap: 'wrap', background: '#fff', borderRadius: 18, padding: 8, animationDelay: '.1s' }}>
          <div style={{ padding: '12px 22px' }}><dt className="small muted">Propiedades</dt><dd style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700 }}>{mias.length}</dd></div>
          <div style={{ padding: '12px 22px', borderLeft: '1px solid var(--line-2)' }}><dt className="small muted">Cobrado este mes</dt><dd style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700 }}>{pesos(cobrado)}</dd></div>
          <div style={{ padding: '12px 22px', borderLeft: '1px solid var(--line-2)' }}><dt className="small muted">Neto transferido</dt><dd style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, color: 'var(--gold-dark)' }}>{pesos(neto)}</dd></div>
        </dl>
      </div>

      <h2 className="h3" style={{ marginBottom: 16 }}>Mis propiedades</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 20, marginBottom: 40 }}>
        {mias.map((m, k) => {
          const e = m.cobro ? estadoCobro(m.cobro) : 'Pendiente'
          const ok = e === 'Pagado' || e === 'Pago c/ recargo'
          return (
            <button key={m.p.id} type="button" onClick={() => setSel(k)} aria-pressed={k === sel} className="fz-in"
              style={{ textAlign: 'left', font: 'inherit', color: 'var(--navy)', cursor: 'pointer', background: '#fff', border: `2px solid ${k === sel ? 'var(--gold)' : 'transparent'}`, borderRadius: 22, padding: 10, display: 'flex', gap: 16, alignItems: 'stretch', transition: 'border-color .3s' }}>
              <Photo ph={m.p.ph} src={m.p.fotos[0]} style={{ flex: '0 0 110px', borderRadius: 16, minHeight: 150 }} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 8px 8px 0', minWidth: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{m.p.titulo}</span>
                <span className="small muted">Inquilino: <strong style={{ color: 'var(--navy)' }}>{m.c!.inquilino.nombre}</strong></span>
                <span className="small muted">Alquiler: <strong style={{ color: 'var(--navy)' }}>{pesos(m.c!.alquiler)}</strong> · Vence {fecha(m.c!.fin)}</span>
                <span className={`badge dot ${ok ? 'b-info' : e === 'En mora' ? 'b-danger' : 'b-warn'}`} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
                  {ok ? `${periodoLargo(actual).split(' ')[0]} cobrado` : e}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="row" style={{ alignItems: 'flex-start' }}>
        {s && (
          <section aria-label="Liquidación del mes" className="card fz-in" style={{ flex: '1 1 420px', minWidth: 0, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', color: '#fff', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div><div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-light)' }}>Liquidación · {periodoLargo(actual)}</div><div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{s.p.titulo}</div></div>
            </div>
            <div key={s.p.id} className="fz-in" style={{ padding: '24px 28px' }}>
              {s.cobro?.pago ? (
                <>
                  <dl style={{ margin: 0 }}>
                    {[['Alquiler cobrado', pesos(s.cobro.pago.total)], ['Comisión administración (10 %)', '− ' + pesos(s.cobro.pago.comision)], ['Gastos de gestión', '$0']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line-3)' }}><dt style={{ color: 'var(--text-2)' }}>{k}</dt><dd style={{ margin: 0, fontWeight: 600 }}>{v}</dd></div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 0 6px' }}><dt style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.14em', textTransform: 'uppercase' }}>Neto a cobrar</dt><dd style={{ margin: 0, fontWeight: 800, fontSize: 30 }}>{pesos(s.cobro.pago.neto)}</dd></div>
                  </dl>
                  <p style={{ margin: '6px 0 20px', fontSize: 13, color: 'var(--muted)' }}>
                    {s.cobro.pago.transferidoPropietario ? `Transferido el ${fecha(s.cobro.pago.transferidoPropietario)} a tu cuenta.` : 'La transferencia a tu cuenta se realiza dentro de las 72 h hábiles.'}
                  </p>
                  <button type="button" className="btn btn-outline" onClick={() => descargar(s.cobro!)}><Icon name="download" size={16} /><Roll>Descargar liquidación</Roll></button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#FBF3EE', borderRadius: 16, padding: 20 }}>
                  <span className="avatar" style={{ background: '#fff', flexBasis: 44, width: 44, height: 44 }}><Icon name="alert" size={20} stroke="#A4441F" /></span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>El alquiler de {periodoLargo(actual).split(' ')[0].toLowerCase()} todavía no se cobró</div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {s.cobro && estadoCobro(s.cobro) === 'En mora'
                        ? `Venció el ${fecha(s.cobro.vencimiento)} (${diasDeMora(s.cobro)} días de mora). La secretaría ya se comunicó con el inquilino; la liquidación se genera cuando se registre el pago con recargo.`
                        : `Vence el ${fecha(s.cobro?.vencimiento)}. La liquidación se genera cuando se registre el pago.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section aria-label="Historial de liquidaciones" className="card fz-in" style={{ flex: '1 1 520px', minWidth: 0, padding: '24px 28px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700 }}>Historial de liquidaciones</h2>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 520, fontSize: 14 }}>
              <thead><tr><th>Período</th><th>Propiedad</th><th>Cobrado</th><th>Neto</th><th><span className="sr-only">Descargar</span></th></tr></thead>
              <tbody>
                {hist.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{periodoCorto(h.periodo)}</td>
                    <td style={{ color: 'var(--text-2)' }}>{mias.find((m) => m.c!.id === h.contratoId)?.p.direccion}</td>
                    <td>{pesos(h.pago!.total)}</td>
                    <td style={{ fontWeight: 700 }}>{pesos(h.pago!.neto)}</td>
                    <td style={{ textAlign: 'right', padding: '6px 10px' }}>
                      <button type="button" className="icon-btn soft" style={{ width: 40, height: 40 }} aria-label={`Descargar liquidación ${periodoCorto(h.periodo)}`} onClick={() => descargar(h)}><Icon name="download" size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
