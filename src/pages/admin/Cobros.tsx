// Cobros mensuales: RF-06 registrar, RF-07 comisión 10 %, RF-08 mora, RF-09 pago con recargo.
// RNF-06: registrar un cobro en no más de 5 pasos (Registrar → datos → Confirmar → Sí → listo).
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { CloseButton, ConfirmDialog, Estado, Field, imprimir, LogoMark, Modal, Pills, Roll, SearchBox } from '../../components/ui'
import type { Cobro, FormaPago } from '../../data/types'
import { useIsMobile } from '../../hooks/useIsMobile'
import { fecha, iniciales, nombreMes, periodoLargo, pesos, pesosCorto, whatsappLink } from '../../lib/format'
import { calcularCobro, diasDeMora, estadoCobro, hoy, parseISO, periodoActual, RECARGO_DIARIO, toISO } from '../../lib/negocio'
import { AdminPageHead } from '../../layouts/AdminLayout'
import { useData } from '../../store/DataContext'

type Filtro = 'Todos' | 'Pagados' | 'Pendientes' | 'En mora'
const grupo = (c: Cobro): Filtro => {
  const e = estadoCobro(c)
  return e === 'En mora' ? 'En mora' : e === 'Pendiente' ? 'Pendientes' : 'Pagados'
}

interface Pago { fecha: string; forma: FormaPago; diasMora: number }
type Paso = { tipo: 'registrar'; id: string; pago?: Pago } | { tipo: 'confirmar'; id: string; pago: Pago } | { tipo: 'listo'; cobro: Cobro }

export default function Cobros() {
  const { cobros, contratos, propiedades, propietarios, registrarPago } = useData()
  const mobile = useIsMobile()
  const [params, setParams] = useSearchParams()
  const [f, setF] = useState<Filtro>('Todos')
  const [q, setQ] = useState('')
  const tablaRef = useRef<HTMLElement>(null)
  const pre = params.get('registrar')
  const [paso, setPasoState] = useState<Paso | null>(() => (pre && cobros.some((c) => c.id === pre && !c.pago) ? { tipo: 'registrar', id: pre } : null))
  const setPaso = (p: Paso | null) => {
    setPasoState(p)
    if (!p && pre) setParams({}, { replace: true })
  }

  const actual = periodoActual()
  const contrato = (id: string) => contratos.find((c) => c.id === id)
  const prop = (id?: string) => propiedades.find((p) => p.id === id)

  // Cobros del mes + los de meses anteriores que siguen impagos
  const delMes = useMemo(() => cobros.filter((c) => c.periodo === actual || (c.periodo < actual && !c.pago)), [cobros, actual])
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return delMes
      .map((c) => ({ c, k: contrato(c.contratoId), estado: estadoCobro(c) }))
      .filter((r) => r.k && (f === 'Todos' || grupo(r.c) === f))
      .filter((r) => !t || `${r.k!.inquilino.nombre} ${prop(r.k!.propiedadId)?.titulo}`.toLowerCase().includes(t))
      .sort((a, b) => ['En mora', 'Pendiente', 'Pago c/ recargo', 'Pagado'].indexOf(a.estado) - ['En mora', 'Pendiente', 'Pago c/ recargo', 'Pagado'].indexOf(b.estado))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delMes, f, q, contratos, propiedades])

  const cuenta = (g: Filtro) => delMes.filter((c) => grupo(c) === g).length
  const esperado = delMes.reduce((s, c) => s + c.alquiler, 0)
  const sum = [
    { l: 'Esperado', v: pesosCorto(esperado), c: 'var(--muted)' },
    { l: 'Pagados', v: cuenta('Pagados'), c: 'var(--ok-fg)' },
    { l: 'Pendientes', v: cuenta('Pendientes'), c: 'var(--gold-soft)' },
    { l: 'En mora', v: cuenta('En mora'), c: 'var(--mora)' },
  ]

  const registrar = (c: Cobro) => setPaso({ tipo: 'registrar', id: c.id })
  const cobroSel = paso && paso.tipo !== 'listo' ? cobros.find((c) => c.id === paso.id) : undefined
  const kSel = cobroSel && contrato(cobroSel.contratoId)

  const accion = (c: Cobro) =>
    c.pago ? (
      <span style={{ fontWeight: 600 }}>{fecha(c.pago.fecha)}</span>
    ) : (
      <button type="button" className="btn btn-sm" onClick={() => registrar(c)} style={{ border: '1px solid var(--navy)', background: '#fff', minHeight: 40, fontSize: 13, fontWeight: 700 }}>
        <Icon name="plus" size={14} width={2.4} />Registrar
      </button>
    )

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <AdminPageHead
        eyebrow={`${contratos.filter((c) => !c.finalizado).length} contratos activos`}
        title={<>Cobros de <span className="gold">{nombreMes(actual).toLowerCase()}</span></>}
        action={!mobile && (
          <button type="button" className="btn btn-outline fz-in" style={{ animationDelay: '.15s' }} onClick={() => imprimir(tablaRef.current)}>
            <Icon name="print" /><Roll>Imprimir cobros</Roll>
          </button>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 28px', marginBottom: 28 }}>
        {sum.map((s, i) => (
          <div key={s.l} className="fz-in" style={{ padding: '20px 0', borderTop: '1px solid var(--line)', animationDelay: `${0.1 + i * 0.04}s` }}>
            <div className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '.16em' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} />{s.l}</div>
            <div style={{ fontSize: mobile ? 32 : 40, fontWeight: 700, letterSpacing: '-.02em', marginTop: 8 }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="toolbar fz-in" style={{ marginBottom: 20, animationDelay: '.25s' }}>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar por inquilino o dirección" />
        <Pills label="Estado" options={['Todos', 'Pagados', 'Pendientes', 'En mora'] as const} value={f} onChange={setF} stretch={mobile} />
      </div>

      {mobile ? (
        <div className="mlist">
          {rows.map(({ c, k, estado }) => (
            <article key={c.id} className="mcard fz-reveal" style={estado === 'En mora' ? { boxShadow: 'inset 3px 0 0 var(--mora)' } : undefined}>
              <div className="mcard-head">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{k!.inquilino.nombre}</div>
                  <div className="small muted">{prop(k!.propiedadId)?.titulo}</div>
                </div>
                <Estado value={estado} />
              </div>
              <div className="mcard-meta">
                <strong style={{ color: 'var(--navy)', fontSize: 16 }}>{pesos(c.pago?.total ?? c.alquiler)}</strong>
                <span>{c.periodo !== actual ? periodoLargo(c.periodo) + ' · ' : ''}vence {fecha(c.vencimiento)}</span>
                {estado === 'En mora' && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{diasDeMora(c)} días de mora</span>}
              </div>
              <div className="mcard-actions" style={{ justifyContent: c.pago ? 'space-between' : 'flex-end', alignItems: 'center' }}>
                {c.pago && <span className="small muted">Pagado el</span>}
                {c.pago ? accion(c) : (
                  <button type="button" className="btn btn-primary btn-block" onClick={() => registrar(c)}><Icon name="plus" size={16} width={2.4} />Registrar cobro</button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section ref={tablaRef} className="card fz-in" aria-label="Cobros del mes" style={{ padding: 'clamp(12px, 2vw, 24px)', animationDelay: '.3s' }}>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 1140, fontSize: 14 }}>
              <thead><tr style={{ fontSize: 11 }}><th>Inquilino</th><th>Propiedad</th><th>Alquiler</th><th>Estado</th><th>N.° Munic.</th><th>N.° Rentas</th><th>N.° Agua</th><th>N.° Luz</th><th>N.° Gas</th><th>Fecha de pago</th></tr></thead>
              <tbody>
                {rows.map(({ c, k, estado }) => (
                  <tr key={c.id}>
                    <td><div style={{ fontWeight: 700, fontSize: 15 }}>{k!.inquilino.nombre}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{k!.inquilino.email}</div></td>
                    <td style={{ color: 'var(--text-2)' }}>{prop(k!.propiedadId)?.titulo}{c.periodo !== actual && <div className="small" style={{ color: 'var(--danger)' }}>{periodoLargo(c.periodo)}</div>}</td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>{pesos(c.pago?.total ?? c.alquiler)}</td>
                    <td><Estado value={estado} /></td>
                    {[k!.nroMunicipalidad, k!.nroRentas, k!.nroAgua, k!.nroLuz, k!.nroGas].map((n, i) => (
                      <td key={i} style={{ color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{n || '—'}</td>
                    ))}
                    <td style={{ whiteSpace: 'nowrap', padding: '8px 10px' }}>{accion(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {rows.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 56 }}>No hay cobros en este estado.</div>}

      {paso?.tipo === 'registrar' && cobroSel && kSel && (
        <RegistrarCobro
          cobro={cobroSel}
          inquilino={kSel.inquilino.nombre}
          propiedad={prop(kSel.propiedadId)?.titulo ?? ''}
          inicial={paso.pago}
          onCancel={() => setPaso(null)}
          onSubmit={(pago) => setPaso({ tipo: 'confirmar', id: cobroSel.id, pago })}
        />
      )}

      {paso?.tipo === 'confirmar' && cobroSel && kSel && (() => {
        const calc = calcularCobro(cobroSel.alquiler, paso.pago.diasMora)
        return (
          <ConfirmDialog
            icon="wallet"
            title={<>¿Está seguro de <span className="gold">confirmar</span> este cobro?</>}
            text="Se emitirá el recibo para el inquilino y se preparará la liquidación del propietario."
            confirmLabel="Sí, confirmar cobro"
            onCancel={() => setPaso({ tipo: 'registrar', id: cobroSel.id, pago: paso.pago })}
            onConfirm={() => {
              const listo = registrarPago(cobroSel.id, paso.pago)
              setPaso({ tipo: 'listo', cobro: listo })
            }}
          >
            <dl className="kv">
              <div><dt>Inquilino</dt><dd>{kSel.inquilino.nombre}</dd></div>
              <div><dt>Período</dt><dd style={{ fontWeight: 600 }}>{periodoLargo(cobroSel.periodo)} · {paso.pago.forma}</dd></div>
              {calc.recargo > 0 && <div><dt>Recargo ({paso.pago.diasMora} días)</dt><dd style={{ fontWeight: 600, color: 'var(--danger)' }}>{pesos(calc.recargo)}</dd></div>}
              <div><dt>Monto cobrado</dt><dd style={{ fontWeight: 800, fontSize: 18 }}>{pesos(calc.total)}</dd></div>
              <div><dt>Neto al propietario</dt><dd style={{ color: 'var(--gold-dark)' }}>{pesos(calc.neto)}</dd></div>
            </dl>
          </ConfirmDialog>
        )
      })()}

      {paso?.tipo === 'listo' && (() => {
        const k = contrato(paso.cobro.contratoId)!
        const p = prop(k.propiedadId)
        const owner = propietarios.find((o) => o.id === p?.propietarioId)
        return <CobroListo cobro={paso.cobro} inquilino={k.inquilino.nombre} direccion={`${p?.direccion}, ${p?.barrio}`} propietario={owner?.nombre ?? ''} onClose={() => setPaso(null)} />
      })()}
    </main>
  )
}

function RegistrarCobro({ cobro, inquilino, propiedad, inicial, onCancel, onSubmit }: {
  cobro: Cobro; inquilino: string; propiedad: string; inicial?: Pago
  onCancel: () => void; onSubmit: (p: Pago) => void
}) {
  const hoyISO = toISO(hoy())
  const [fechaPago, setFecha] = useState(inicial?.fecha ?? hoyISO)
  const [forma, setForma] = useState<FormaPago>(inicial?.forma ?? 'Transferencia')
  const auto = diasDeMora(cobro, parseISO(fechaPago))
  const [ajuste, setAjuste] = useState<number | null>(inicial && inicial.diasMora !== auto ? inicial.diasMora : null)
  const dias = ajuste ?? auto
  const calc = calcularCobro(cobro.alquiler, dias)
  const enMora = estadoCobro(cobro) === 'En mora' || dias > 0
  const futuro = fechaPago > hoyISO

  return (
    <Modal onClose={onCancel} width={900} split label="Registrar cobro">
      <div style={{ flex: 1.2, padding: 'clamp(22px, 3vw, 32px) clamp(18px, 3vw, 36px) 30px', minWidth: 0 }}>
        <div className="modal-head" style={{ marginBottom: 20 }}>
          <div>
            <p className="eyebrow line">{periodoLargo(cobro.periodo)} · vence {fecha(cobro.vencimiento)}</p>
            <h1 className="modal-title"><span className="fz-line"><span>Registrar <span className="gold">cobro</span></span></span></h1>
          </div>
          <CloseButton onClick={onCancel} />
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <span className="avatar navy" style={{ flexBasis: 46, width: 46, height: 46, fontSize: 14, fontWeight: 800 }}>{iniciales(inquilino)}</span>
          <div style={{ flex: 1, lineHeight: 1.45, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 16 }}>{inquilino}</div><div style={{ fontSize: 14, color: 'var(--muted)' }}>{propiedad}</div></div>
          <Estado value={estadoCobro(cobro)} />
        </div>
        {enMora && (
          <p role="note" style={{ margin: '0 0 14px', display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.55, color: 'var(--danger-fg)', background: 'var(--danger-bg)', borderRadius: 12, padding: '10px 14px' }}>
            <Icon name="alert" size={16} width={2.2} />
            Pago fuera de término: se aplica el recargo pactado en el contrato y el cobro queda como “Pago c/ recargo”.
          </p>
        )}
        <form className="form-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }} onSubmit={(e) => { e.preventDefault(); if (!futuro) onSubmit({ fecha: fechaPago, forma, diasMora: dias }) }}>
          <Field label="Monto recibido" className="full" readOnly>
            <input readOnly value={pesos(calc.total)} style={{ fontSize: 20, fontWeight: 700 }} />
          </Field>
          <fieldset className="full" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Forma de pago</legend>
            <Pills label="Forma de pago" options={['Transferencia', 'Efectivo'] as const} value={forma} onChange={setForma} stretch />
          </fieldset>
          <Field label="Fecha de pago" required invalid={futuro}>
            <input type="date" value={fechaPago} max={hoyISO} onChange={(e) => { setFecha(e.target.value); setAjuste(null) }} />
          </Field>
          <div className="field" style={{ paddingRight: 8 }}>
            <span>Días de mora</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-live="polite" style={{ flex: 1, fontSize: 16, fontWeight: 700, color: dias ? 'var(--danger)' : 'var(--navy)' }}>{dias}</span>
              <button type="button" aria-label="Restar un día" onClick={() => setAjuste(Math.max(0, dias - 1))} className="icon-btn soft" style={{ width: 32, height: 32 }}>−</button>
              <button type="button" aria-label="Sumar un día" onClick={() => setAjuste(dias + 1)} className="icon-btn soft" style={{ width: 32, height: 32 }}>+</button>
            </div>
          </div>
          {futuro && <p role="alert" className="field-error" style={{ gridColumn: '1 / -1' }}>La fecha de pago no puede ser posterior a hoy.</p>}
          <button type="submit" id="confirmar-cobro" className="sr-only" tabIndex={-1}>Confirmar</button>
        </form>
      </div>
      <aside style={{ flex: 1, background: 'var(--navy)', color: '#fff', padding: 'clamp(22px, 3vw, 32px)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minWidth: 0 }}>
        <svg aria-hidden="true" viewBox="0 0 200 200" style={{ position: 'absolute', right: -50, top: -40, width: 220, height: 220, opacity: 0.07 }}>
          <g fill="none" stroke="#E2C68F" strokeWidth="3"><path d="M20 100 L100 30 L180 100" /><path d="M40 85 V180 H160 V85" /><path d="M80 180 V130 H120 V180" /></g>
        </svg>
        <p style={{ position: 'relative', margin: '0 0 14px', fontSize: 12, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold-light)' }}>Cálculo automático</p>
        <dl style={{ position: 'relative', margin: 0, fontSize: 14 }}>
          {[
            ['Alquiler', pesos(cobro.alquiler)],
            [`Recargo por mora (${String(RECARGO_DIARIO * 100).replace('.', ',')} % diario)`, pesos(calc.recargo)],
            ['Monto cobrado', pesos(calc.total)],
            ['Comisión inmobiliaria (10 %)', '− ' + pesos(calc.comision)],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.14)' }}>
              <dt style={{ color: '#C9D1DE' }}>{k}</dt><dd style={{ margin: 0, fontWeight: 700, color: i === 3 ? 'var(--gold-light)' : undefined, whiteSpace: 'nowrap' }}>{v}</dd>
            </div>
          ))}
        </dl>
        <div style={{ position: 'relative', marginTop: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C9D1DE' }}>Neto al propietario</div>
          <div style={{ fontSize: 'clamp(34px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--gold-light)' }}>{pesos(calc.neto)}</div>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto', paddingTop: 22 }}>
          <button type="button" className="btn btn-white" disabled={futuro} onClick={() => document.getElementById('confirmar-cobro')?.click()} style={{ minHeight: 54, fontWeight: 700 }}>
            <Roll>Confirmar cobro</Roll><Icon name="arrowRight" size={16} />
          </button>
          <button type="button" className="btn btn-ghost-light" onClick={onCancel}><Roll>Cancelar</Roll></button>
        </div>
      </aside>
    </Modal>
  )
}

function CobroListo({ cobro, inquilino, direccion, propietario, onClose }: { cobro: Cobro; inquilino: string; direccion: string; propietario: string; onClose: () => void }) {
  const recibo = useRef<HTMLElement>(null)
  const p = cobro.pago!
  const mensaje = `Hola ${inquilino.split(' ')[0]}, te enviamos el recibo N.° ${p.recibo} del alquiler de ${periodoLargo(cobro.periodo).toLowerCase()} por ${pesos(p.total)}. ¡Gracias! — Futura Servicios Inmobiliarios`
  return (
    <Modal onClose={onClose} width={880} split role="status" label="Cobro registrado">
      <div style={{ flex: 1, padding: 'clamp(24px, 3vw, 40px)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="confirm-icon fz-pop" style={{ width: 76, height: 76, marginBottom: 24 }}><Icon name="check" size={34} width={2.4} /></div>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(30px, 3vw, 38px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.05 }}>
          <span className="fz-line"><span>Cobro <span className="gold">registrado</span></span></span>
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)' }}>
          El pago de {inquilino} quedó como “{p.diasMora ? 'Pago c/ recargo' : 'Pagado'}”. El recibo N.° {p.recibo} ya está listo y la liquidación de {propietario} se generó con un neto de <strong style={{ color: 'var(--navy)' }}>{pesos(p.neto)}</strong>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
          <button type="button" className="btn btn-primary" onClick={() => imprimir(recibo.current)} style={{ minHeight: 54 }}><Icon name="print" stroke="#E2C68F" /><Roll>Imprimir recibo</Roll></button>
          <a href={whatsappLink(mensaje, '')} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }}><Icon name="whatsapp" />Enviar por WhatsApp</a>
          <button type="button" onClick={onClose} className="link-underline" style={{ alignSelf: 'center', marginTop: 6, background: 'none', border: 0, borderBottom: '1px solid var(--gold)', cursor: 'pointer', padding: '8px 0 3px' }}>Volver a cobros</button>
        </div>
      </div>
      <div style={{ flex: 1, background: 'var(--ground)', padding: 'clamp(16px, 3vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
        <article ref={recibo} aria-label="Vista previa del recibo" className="fz-in" style={{ width: '100%', background: '#fff', borderRadius: 4, boxShadow: '0 20px 50px rgba(15,30,58,.14)', overflow: 'hidden', fontSize: 13 }}>
          <div style={{ background: 'var(--navy)', color: '#fff', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
            <span className="brand" style={{ color: '#fff', gap: 10 }}>
              <LogoMark size={26} color="#E2C68F" door="#E2C68F" />
              <span className="brand-text"><b style={{ fontSize: 14, letterSpacing: '.2em' }}>FUTURA</b><small style={{ fontSize: 8, color: '#E2C68F' }}>SERVICIOS INMOBILIARIOS</small></span>
            </span>
            <span style={{ fontSize: 10, textAlign: 'right', color: '#C9D1DE', lineHeight: 1.5 }}>Ventas · Alquileres<br />Tasaciones · Administración</span>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <strong style={{ letterSpacing: '.1em' }}>RECIBO ALQUILER {periodoLargo(cobro.periodo).toUpperCase()}</strong><span className="muted">N.° {p.recibo}</span>
            </div>
            <p style={{ margin: '0 0 12px', color: 'var(--text-2)', lineHeight: 1.55 }}>Recibí de {inquilino} en concepto de alquiler mensual del inmueble sito en {direccion}:</p>
            <dl style={{ margin: 0, borderTop: '1px solid var(--navy)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line-3)' }}><dt>Alquiler {periodoLargo(cobro.periodo).toLowerCase()}</dt><dd style={{ margin: 0, fontWeight: 700 }}>{pesos(cobro.alquiler)}</dd></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line-3)' }}><dt>Recargo por mora{p.diasMora ? ` (${p.diasMora} días)` : ''}</dt><dd style={{ margin: 0 }}>{pesos(p.recargo)}</dd></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0' }}><dt style={{ fontWeight: 800, letterSpacing: '.08em' }}>TOTAL</dt><dd style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{pesos(p.total)}</dd></div>
            </dl>
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px dashed var(--btn-line)', display: 'flex', justifyContent: 'space-between', gap: 10, color: 'var(--muted)', fontSize: 11, flexWrap: 'wrap' }}>
              <span>Diana Lazarte · Martillero Corredor</span><span>Córdoba, {fecha(p.fecha)} · {p.forma}</span>
            </div>
          </div>
        </article>
      </div>
    </Modal>
  )
}
