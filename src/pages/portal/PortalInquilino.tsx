// RF-12: el inquilino consulta si pagó, el monto actual, el vencimiento y el próximo aumento.
import { Icon } from '../../components/Icon'
import { Estado, Lines, Photo, Roll } from '../../components/ui'
import { fecha, fechaLarga, periodoLargo, pesos, whatsappLink } from '../../lib/format'
import { calcularCobro, diasEntre, diasDeMora, estadoCobro, hoy, parseISO, periodoActual, sumarMeses, toISO } from '../../lib/negocio'
import { useAuth } from '../../store/AuthContext'
import { useData } from '../../store/DataContext'

export default function PortalInquilino() {
  const { usuario } = useAuth()
  const { contratos, cobros, propiedades } = useData()
  const c = contratos.find((x) => x.id === usuario?.refId) ?? contratos.find((x) => x.inquilino.email === usuario?.email)

  if (!c) {
    return <main className="container" style={{ paddingTop: 40 }}><div className="card">No encontramos un contrato activo a tu nombre. Comunicate con la inmobiliaria.</div></main>
  }

  const p = propiedades.find((x) => x.id === c.propiedadId)
  const historial = cobros.filter((x) => x.contratoId === c.id).sort((a, b) => b.periodo.localeCompare(a.periodo))
  const actual = historial.find((x) => x.periodo === periodoActual()) ?? historial[0]
  const estado = actual ? estadoCobro(actual) : 'Pendiente'
  const pagado = !!actual?.pago
  const proximo = actual ? (() => { const d = parseISO(actual.vencimiento); d.setMonth(d.getMonth() + 1); return d })() : hoy()
  const totalMeses = Math.max(1, Math.round(diasEntre(parseISO(c.inicio), parseISO(c.fin)) / 30.4))
  const transcurridos = Math.min(totalMeses, Math.max(0, Math.round(diasEntre(parseISO(c.inicio), hoy()) / 30.4)))
  const faltanAumento = c.proximoAumento ? diasEntre(hoy(), parseISO(c.proximoAumento)) : null

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <p className="eyebrow fz-in" style={{ marginBottom: 10 }}>{fechaLarga()}</p>
      <h1 style={{ margin: '0 0 36px', fontSize: 'clamp(34px, 3.8vw, 52px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.06 }}>
        <Lines lines={[<>Hola, <span className="gold">{c.inquilino.nombre.split(' ')[0]}</span></>]} />
      </h1>

      <div className="row" style={{ marginBottom: 20 }}>
        <section className="card dark fz-in" aria-label="Estado del período" style={{ flex: '2 1 600px', minWidth: 0, padding: 'clamp(24px, 3vw, 40px)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 28, animationDelay: '.1s' }}>
          <svg aria-hidden="true" viewBox="0 0 200 200" style={{ position: 'absolute', right: -40, bottom: -60, width: 300, height: 300, opacity: 0.08 }}>
            <g fill="none" stroke="#E2C68F" strokeWidth="3"><path d="M20 100 L100 30 L180 100" /><path d="M40 85 V180 H160 V85" /><path d="M80 180 V130 H120 V180" /></g>
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-light)' }}>Período actual · {actual ? periodoLargo(actual.periodo) : '—'}</div>
            <div style={{ fontSize: 'clamp(40px, 4.4vw, 60px)', fontWeight: 700, letterSpacing: '-.02em', margin: '10px 0 6px' }}>{pesos(actual?.pago?.total ?? actual?.alquiler ?? c.alquiler)}</div>
            <div style={{ fontSize: 15, color: '#C9D1DE' }}>
              {pagado ? `Pagado el ${fecha(actual!.pago!.fecha)} · vencía el ${fecha(actual!.vencimiento)}` : estado === 'En mora' ? `Venció el ${fecha(actual!.vencimiento)} · ${diasDeMora(actual!)} días de atraso` : `Vence el ${fecha(actual?.vencimiento)}`}
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: estado === 'En mora' ? 'var(--danger-bg)' : '#fff', color: estado === 'En mora' ? 'var(--danger-fg)' : 'var(--navy)', fontWeight: 700, fontSize: 14, padding: '10px 16px', borderRadius: 999 }}>
              <Icon name={pagado ? 'check' : 'alert'} size={16} width={2.4} />{estado}
            </span>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#C9D1DE' }}>{pagado ? 'Próximo vencimiento' : 'Monto con recargo hoy'}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{pagado ? fecha(toISO(proximo)) : pesos(calcularCobro(actual?.alquiler ?? 0, diasDeMora(actual!)).total)}</div>
            </div>
          </div>
        </section>

        <section className="card fz-in" aria-label="Próximo aumento" style={{ flex: '1 1 320px', border: '1px solid #E8DCC4', animationDelay: '.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-dark)' }}>Próximo aumento</span>
            <span className="avatar" style={{ background: 'var(--warn-bg)' }}><Icon name="trend" stroke="#8A6A2E" /></span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.02em' }}>{c.proximoAumento ? fecha(c.proximoAumento) : 'Sin fecha'}</div>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {faltanAumento !== null && faltanAumento >= 0 ? <>Faltan <strong style={{ color: 'var(--navy)' }}>{faltanAumento} días</strong>. </> : null}
            Ajuste semestral según contrato; te avisamos el monto nuevo antes del vencimiento.
          </p>
        </section>
      </div>

      <div className="row" style={{ marginBottom: 20 }}>
        <section className="card pad-sm fz-in" aria-label="Mi contrato" style={{ flex: '2 1 600px', minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 20, animationDelay: '.3s' }}>
          <Photo ph={p?.ph ?? 'ph-a'} src={p?.fotos[0]} tag="Fachada" style={{ flex: '1 1 240px', minHeight: 220, borderRadius: 18 }} />
          <div style={{ flex: '2 1 320px', padding: '16px 16px 16px 4px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="label-caps" style={{ letterSpacing: '.2em' }}>Mi contrato</div>
              <h2 style={{ margin: '6px 0 2px', fontSize: 24, fontWeight: 700 }}>{p?.titulo}</h2>
              <div className="small muted" style={{ fontSize: 14 }}>{p?.direccion} · Contrato de locación {totalMeses} meses</div>
            </div>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, padding: '14px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
              <div><dt className="small muted">Inicio</dt><dd style={{ margin: '2px 0 0', fontWeight: 700 }}>{fecha(c.inicio)}</dd></div>
              <div><dt className="small muted">Fin</dt><dd style={{ margin: '2px 0 0', fontWeight: 700 }}>{fecha(c.fin)}</dd></div>
              <div><dt className="small muted">Alquiler</dt><dd style={{ margin: '2px 0 0', fontWeight: 700 }}>{pesos(c.alquiler)}</dd></div>
            </dl>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}><span>Vigencia del contrato</span><span><strong style={{ color: 'var(--navy)' }}>{transcurridos}</strong> de {totalMeses} meses</span></div>
              <div style={{ height: 8, background: 'var(--line-3)', borderRadius: 8, overflow: 'hidden' }}>
                <div className="fz-grow" style={{ height: 8, width: `${(transcurridos / totalMeses) * 100}%`, background: 'linear-gradient(90deg, #0F1E3A, #A9823C)', borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </section>

        <section className="card fz-in" aria-label="Cómo pagar" style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 14, animationDelay: '.35s' }}>
          <div className="label-caps" style={{ letterSpacing: '.2em' }}>Cómo pagar</div>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>En efectivo en la oficina o por transferencia. Enviá el comprobante por WhatsApp.</p>
          <div style={{ background: 'var(--ground)', borderRadius: 14, padding: '14px 16px', fontSize: 14, lineHeight: 1.8 }}>
            <div><span className="muted">Alias</span> · <strong>[ALIAS DE LA INMOBILIARIA]</strong></div>
            <div><span className="muted">CBU</span> · <strong>[CBU]</strong></div>
          </div>
          <a href={whatsappLink(`Hola, soy ${c.inquilino.nombre}. Les envío el comprobante del alquiler de ${p?.direccion}.`)} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: 'auto' }}><Roll>Enviar comprobante</Roll></a>
        </section>
      </div>

      <section className="card fz-in" aria-label="Historial de pagos" style={{ padding: 'clamp(20px, 2.6vw, 32px)', animationDelay: '.45s' }}>
        <div className="between" style={{ alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 className="h3">Historial de pagos</h2>
          <span className="small muted">El recibo te lo entrega la secretaría</span>
        </div>
        <div className="table-wrap">
          <table className="table" style={{ minWidth: 560 }}>
            <thead><tr><th>Período</th><th>Vencimiento</th><th>Monto</th><th>Fecha de pago</th><th>Estado</th></tr></thead>
            <tbody>
              {historial.filter((x) => x.periodo >= sumarMeses(periodoActual(), -11)).map((h) => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{periodoLargo(h.periodo)}</td>
                  <td style={{ color: 'var(--text-2)' }}>{fecha(h.vencimiento)}</td>
                  <td>{pesos(h.pago?.total ?? h.alquiler)}</td>
                  <td style={{ color: 'var(--text-2)' }}>{fecha(h.pago?.fecha)}</td>
                  <td><Estado value={estadoCobro(h)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
