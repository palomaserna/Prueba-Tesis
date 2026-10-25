// Contratos de locación: alta, edición, renovación / rescisión (RF-04) y alertas de vencimiento (RF-05).
import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { CloseButton, ConfirmDialog, Estado, Field, Modal, Pills, Roll, SearchBox } from '../../components/ui'
import type { Contrato, EstadoContrato, Garantia } from '../../data/types'
import { useIsMobile } from '../../hooks/useIsMobile'
import { fecha, iniciales, pesos } from '../../lib/format'
import { diasParaVencer, estadoContrato, parseISO, toISO } from '../../lib/negocio'
import { AdminPageHead } from '../../layouts/AdminLayout'
import { useData } from '../../store/DataContext'

type Filtro = 'Todos' | EstadoContrato
type Borrador = Omit<Contrato, 'id'> & { id?: string }
type Paso = { tipo: 'form'; c?: Borrador } | { tipo: 'confirmar'; c: Borrador } | { tipo: 'eliminar'; c: Contrato }

export default function Contratos() {
  const { contratos, propiedades, guardarContrato, eliminarContrato, cobros } = useData()
  const mobile = useIsMobile()
  const [params, setParams] = useSearchParams()
  const [f, setF] = useState<Filtro>('Todos')
  const [q, setQ] = useState('')
  const [aviso, setAviso] = useState('')
  const editarId = params.get('editar')
  const [paso, setPasoState] = useState<Paso | null>(() => {
    const c = contratos.find((x) => x.id === editarId)
    return c ? { tipo: 'form', c } : null
  })
  const setPaso = (p: Paso | null) => {
    setPasoState(p)
    if (!p && editarId) setParams({}, { replace: true })
  }

  const prop = (id: string) => propiedades.find((p) => p.id === id)
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return contratos
      .map((c) => ({ c, estado: estadoContrato(c), p: prop(c.propiedadId) }))
      .filter((r) => f === 'Todos' || r.estado === f)
      .filter((r) => !t || `${r.c.inquilino.nombre} ${r.p?.titulo} ${r.p?.direccion}`.toLowerCase().includes(t))
      .sort((a, b) => (a.estado === 'Finalizado' ? 1 : 0) - (b.estado === 'Finalizado' ? 1 : 0) || a.c.fin.localeCompare(b.c.fin))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contratos, propiedades, f, q])

  const activos = contratos.filter((c) => estadoContrato(c) !== 'Finalizado').length
  const notificar = (m: string) => {
    setAviso(m)
    setTimeout(() => setAviso(''), 3500)
  }

  const acciones = (c: Contrato) => (
    <>
      <button type="button" className="icon-btn soft" aria-label={`Editar contrato de ${c.inquilino.nombre}`} onClick={() => setPaso({ tipo: 'form', c })} style={{ width: 42, height: 42 }}><Icon name="edit" size={16} /></button>
      <button type="button" className="icon-btn soft danger" aria-label={`Eliminar contrato de ${c.inquilino.nombre}`} onClick={() => setPaso({ tipo: 'eliminar', c })} style={{ width: 42, height: 42 }}><Icon name="trash" size={16} /></button>
    </>
  )

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <AdminPageHead
        eyebrow={`${activos} contratos vigentes`}
        title={<>Contratos de <span className="gold">alquiler</span></>}
        action={!mobile && (
          <button type="button" className="btn btn-primary fz-in" style={{ animationDelay: '.15s' }} onClick={() => setPaso({ tipo: 'form' })}>
            <Icon name="plus" stroke="#E2C68F" width={2.4} /><Roll>Nuevo contrato</Roll>
          </button>
        )}
      />

      <div className="toolbar fz-in" style={{ marginBottom: 20, animationDelay: '.2s' }}>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar por inquilino o dirección" />
        <Pills label="Estado" options={[['Todos', 'Todos'], ['Activo', 'Activos'], ['Por vencer', 'Por vencer'], ['Finalizado', 'Finalizados']] as const} value={f} onChange={setF} />
      </div>

      {mobile ? (
        <div className="mlist">
          {rows.map(({ c, estado, p }) => (
            <article key={c.id} className="mcard fz-reveal">
              <div className="mcard-head">
                <span className="avatar">{iniciales(c.inquilino.nombre)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{c.inquilino.nombre}</div>
                  <div className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.titulo}</div>
                </div>
                <Estado value={estado} />
              </div>
              <div className="mcard-meta">
                <span>{fecha(c.inicio)} → {fecha(c.fin)}</span>
                <strong style={{ color: 'var(--navy)' }}>{pesos(c.alquiler)}</strong>
                {estado === 'Por vencer' && <span style={{ color: 'var(--warn-fg)', fontWeight: 600 }}>Vence en {diasParaVencer(c)} días</span>}
              </div>
              <div className="mcard-actions">{acciones(c)}</div>
            </article>
          ))}
        </div>
      ) : (
        <section className="card fz-in" aria-label="Listado de contratos" style={{ padding: 'clamp(12px, 2vw, 24px)', animationDelay: '.28s' }}>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 980 }}>
              <thead><tr><th>Inquilino</th><th>Propiedad</th><th>Vigencia</th><th>Alquiler</th><th>Estado</th><th>Vence</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                {rows.map(({ c, estado, p }) => (
                  <tr key={c.id}>
                    <td><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span className="avatar">{iniciales(c.inquilino.nombre)}</span><div><div style={{ fontWeight: 700 }}>{c.inquilino.nombre}</div><div className="small muted">{c.inquilino.email}</div></div></div></td>
                    <td style={{ color: 'var(--text-2)' }}>{p?.titulo}</td>
                    <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap', fontSize: 14 }}>{fecha(c.inicio)} → {fecha(c.fin)}</td>
                    <td style={{ fontWeight: 700 }}>{pesos(c.alquiler)}</td>
                    <td><Estado value={estado} /></td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{estado === 'Por vencer' ? <span style={{ color: 'var(--warn-fg)' }}>en {diasParaVencer(c)} días</span> : fecha(c.fin)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '8px 12px' }}><span style={{ display: 'inline-flex', gap: 4 }}>{acciones(c)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {rows.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 56 }}>No hay contratos con esos filtros.</div>}

      {mobile && <button type="button" className="fab" onClick={() => setPaso({ tipo: 'form' })}><Icon name="plus" stroke="#E2C68F" width={2.4} />Nuevo</button>}

      {paso?.tipo === 'form' && <ContratoForm inicial={paso.c} onCancel={() => setPaso(null)} onSubmit={(c) => setPaso({ tipo: 'confirmar', c })} />}

      {paso?.tipo === 'confirmar' && (
        <ConfirmDialog
          icon={paso.c.id ? 'edit' : 'file'}
          title={paso.c.id ? <>¿Está seguro de <span className="gold">guardar</span> los cambios del contrato?</> : <>¿Está seguro de crear un <span className="gold">nuevo</span> contrato?</>}
          text={paso.c.id ? 'Los cobros pendientes tomarán el nuevo monto.' : 'La propiedad pasará a "Alquilada" y se generará el cobro del mes.'}
          confirmLabel={paso.c.id ? 'Sí, guardar cambios' : 'Sí, crear contrato'}
          onCancel={() => setPaso({ tipo: 'form', c: paso.c })}
          onConfirm={() => {
            guardarContrato(paso.c)
            notificar(paso.c.id ? 'Contrato actualizado.' : 'Contrato creado.')
            setPaso(null)
          }}
        >
          <dl className="kv">
            <div><dt>Inquilino</dt><dd>{paso.c.inquilino.nombre}</dd></div>
            <div><dt>Propiedad</dt><dd style={{ fontWeight: 600 }}>{prop(paso.c.propiedadId)?.titulo}</dd></div>
            <div><dt>Vigencia</dt><dd style={{ fontWeight: 600 }}>{fecha(paso.c.inicio)} → {fecha(paso.c.fin)}</dd></div>
            <div><dt>Alquiler</dt><dd style={{ fontSize: 18, fontWeight: 800 }}>{pesos(paso.c.alquiler)}</dd></div>
          </dl>
        </ConfirmDialog>
      )}

      {paso?.tipo === 'eliminar' && (
        <ConfirmDialog
          danger icon="trash"
          title={<>¿Está seguro de <span style={{ color: 'var(--danger)' }}>eliminar</span> este contrato?</>}
          text="El contrato y su historial de cobros dejarán de figurar en el listado. Esta acción no se puede deshacer."
          confirmLabel="Sí, eliminar"
          onCancel={() => setPaso(null)}
          onConfirm={() => {
            eliminarContrato(paso.c.id)
            notificar('Contrato eliminado.')
            setPaso(null)
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 16, padding: '14px 16px' }}>
            <span className="avatar" style={{ background: '#fff', flexBasis: 46, width: 46, height: 46 }}>{iniciales(paso.c.inquilino.nombre)}</span>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{paso.c.inquilino.nombre}</div>
              <div className="muted">{prop(paso.c.propiedadId)?.titulo} · {fecha(paso.c.inicio)} → {fecha(paso.c.fin)}</div>
            </div>
            <Estado value={estadoContrato(paso.c)} caps />
          </div>
          {cobros.some((x) => x.contratoId === paso.c.id && !x.pago) && (
            <p role="alert" style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--danger)', display: 'flex', gap: 8 }}><Icon name="alert" size={16} />Tiene cobros sin registrar que también se eliminarán.</p>
          )}
        </ConfirmDialog>
      )}

      {aviso && <div className="toast" role="status"><Icon name="check" stroke="#E2C68F" />{aviso}</div>}
    </main>
  )
}

function ContratoForm({ inicial, onCancel, onSubmit }: { inicial?: Borrador; onCancel: () => void; onSubmit: (c: Borrador) => void }) {
  const { propiedades, propietarios, contratos } = useData()
  const editando = !!inicial?.id
  const [propiedadId, setPropiedadId] = useState(inicial?.propiedadId ?? '')
  const [fin, setFin] = useState(inicial?.fin ?? '')
  const [finalizado, setFinalizado] = useState(inicial?.finalizado ?? false)
  const [error, setError] = useState<string[]>([])
  const ocupadas = new Set(contratos.filter((c) => c.id !== inicial?.id && estadoContrato(c) !== 'Finalizado').map((c) => c.propiedadId))
  const opciones = propiedades.filter((p) => p.operacion === 'Alquiler' && (p.id === inicial?.propiedadId || (!ocupadas.has(p.id) && p.estado === 'Disponible')))
  const elegida = propiedades.find((p) => p.id === propiedadId)
  const propietario = propietarios.find((o) => o.id === elegida?.propietarioId)

  const renovar = () => {
    const d = parseISO(fin || toISO(new Date()))
    d.setMonth(d.getMonth() + 24)
    setFin(toISO(d))
    setFinalizado(false)
  }

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const s = (k: string) => String(f.get(k) ?? '').trim()
    const alquiler = Number(s('alquiler').replace(/[^\d]/g, ''))
    const faltan = [
      !s('nombre') && 'inquilino', !propiedadId && 'propiedad', !s('inicio') && 'fecha de inicio', !fin && 'fecha de fin', !alquiler && 'alquiler',
      s('inicio') && fin && fin <= s('inicio') && 'fin posterior al inicio',
    ].filter(Boolean) as string[]
    if (faltan.length) {
      setError(faltan)
      return
    }
    onSubmit({
      ...inicial,
      id: inicial?.id,
      inquilino: { nombre: s('nombre'), email: s('email') },
      propiedadId, inicio: s('inicio'), fin, proximoAumento: s('proximoAumento') || undefined, alquiler,
      garantia: s('garantia') as Garantia, finalizado,
      nroMunicipalidad: s('nroMunicipalidad'), nroRentas: s('nroRentas'), nroAgua: s('nroAgua'), nroLuz: s('nroLuz'), nroGas: s('nroGas'),
      descripcion: s('descripcion'),
    })
  }
  const inv = (k: string) => error.includes(k)

  return (
    <Modal onClose={onCancel} label={editando ? 'Editar contrato' : 'Nuevo contrato'}>
      <div className="modal-head">
        <div>
          <p className="eyebrow line">{editando ? 'Edición de contrato' : 'Alta de contrato de locación'}</p>
          <h1 className="modal-title"><span className="fz-line"><span>{editando ? 'Editar' : 'Nuevo'} <span className="gold">contrato</span></span></span></h1>
        </div>
        <CloseButton onClick={onCancel} />
      </div>
      <form className="form-grid" onSubmit={enviar} noValidate style={{ gap: 11 }}>
        <Field label="Inquilino" required className="span-3" invalid={inv('inquilino')}><input name="nombre" defaultValue={inicial?.inquilino.nombre} placeholder="Nombre y apellido" /></Field>
        <Field label="Email del inquilino" className="span-3"><input name="email" type="email" defaultValue={inicial?.inquilino.email} placeholder="nombre@mail.com" /></Field>
        <Field label="Propiedad" required className="span-3" invalid={inv('propiedad')}>
          <select value={propiedadId} onChange={(e) => setPropiedadId(e.target.value)}>
            <option value="" disabled>Seleccionar propiedad disponible</option>
            {opciones.map((p) => <option key={p.id} value={p.id}>{p.titulo} · {p.direccion}</option>)}
          </select>
        </Field>
        <Field label="Propietario" className="span-3" readOnly><input readOnly value={propietario?.nombre ?? ''} placeholder="Se completa al elegir la propiedad" /></Field>
        <Field label="Fecha de inicio" required className="span-2" invalid={inv('fecha de inicio') || inv('fin posterior al inicio')}><input name="inicio" type="date" defaultValue={inicial?.inicio} /></Field>
        <Field label="Fecha de fin" required className="span-2" invalid={inv('fecha de fin') || inv('fin posterior al inicio')}><input type="date" value={fin} onChange={(e) => setFin(e.target.value)} /></Field>
        <Field label="Próximo aumento" className="span-2"><input name="proximoAumento" type="date" defaultValue={inicial?.proximoAumento} /></Field>
        <Field label="Alquiler mensual ($)" required className="span-2" invalid={inv('alquiler')}><input name="alquiler" inputMode="numeric" defaultValue={inicial?.alquiler ?? elegida?.alquiler ?? ''} key={elegida?.id} placeholder="$" /></Field>
        <Field label="Estado" className="span-2">
          <select value={finalizado ? 'fin' : 'vig'} onChange={(e) => setFinalizado(e.target.value === 'fin')}>
            <option value="vig">Vigente</option><option value="fin">Rescindido / finalizado</option>
          </select>
        </Field>
        <Field label="Garantía" className="span-2">
          <select name="garantia" defaultValue={inicial?.garantia ?? 'Garantía propietaria'}><option>Garantía propietaria</option><option>Seguro de caución</option></select>
        </Field>
        {editando && (
          <div className="span-6" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: 'var(--surface-2)', borderRadius: 12, padding: '10px 14px' }}>
            <span className="small" style={{ flex: 1, minWidth: 200, color: 'var(--text-2)' }}>
              {finalizado ? 'El contrato quedará como finalizado y la propiedad volverá a estar disponible.' : fin ? `Vence el ${fecha(fin)}${diasParaVencer({ ...inicial!, fin, finalizado } as Contrato) <= 30 ? ' · está por vencer' : ''}.` : ''}
            </span>
            <button type="button" className="btn btn-sm" style={{ background: '#fff', border: '1px solid var(--btn-line)' }} onClick={renovar}><Icon name="refresh" size={16} />Renovar 24 meses</button>
          </div>
        )}
        <p className="section-label">Servicios del inmueble · N.° de cuenta</p>
        <Field label="N.° Municipalidad" className="span-2"><input name="nroMunicipalidad" inputMode="numeric" defaultValue={inicial?.nroMunicipalidad} /></Field>
        <Field label="N.° Rentas" className="span-2"><input name="nroRentas" inputMode="numeric" defaultValue={inicial?.nroRentas} /></Field>
        <Field label="N.° Agua" className="span-2"><input name="nroAgua" inputMode="numeric" defaultValue={inicial?.nroAgua} /></Field>
        <Field label="N.° Luz (EPEC)" className="span-3"><input name="nroLuz" inputMode="numeric" defaultValue={inicial?.nroLuz} /></Field>
        <Field label="N.° Gas" className="span-3"><input name="nroGas" inputMode="numeric" defaultValue={inicial?.nroGas} /></Field>
        <Field label="Descripción" className="span-6"><textarea name="descripcion" rows={1} defaultValue={inicial?.descripcion} placeholder="Cláusulas especiales u observaciones" style={{ resize: 'none' }} /></Field>
        {error.length > 0 && <p role="alert" className="field-error">Revisá: {error.join(', ')}.</p>}
        <div className="form-footer">
          <span className="small muted"><span className="req">*</span> Campos obligatorios</span>
          <span className="btns">
            <button type="button" className="btn btn-outline" onClick={onCancel}><Roll>Cancelar</Roll></button>
            <button type="submit" className="btn btn-primary"><Roll>{editando ? 'Guardar cambios' : 'Crear contrato'}</Roll><Icon name="arrowRight" size={16} /></button>
          </span>
        </div>
      </form>
    </Modal>
  )
}
