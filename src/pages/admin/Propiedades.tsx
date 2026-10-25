// RF-01 / RF-02: alta, modificación, consulta y cambio de estado de propiedades.
import { useMemo, useState, type DragEvent, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { CloseButton, ConfirmDialog, Estado, Field, Modal, Photo, Pills, Roll, SearchBox } from '../../components/ui'
import { ETAPAS_VENTA, type EstadoPropiedad, type EtapaVenta, type Operacion, type Placeholder, type Propiedad, type TipoPropiedad } from '../../data/types'
import { useIsMobile } from '../../hooks/useIsMobile'
import { precioPropiedad } from '../../lib/format'
import { estadoContrato } from '../../lib/negocio'
import { AdminPageHead } from '../../layouts/AdminLayout'
import { useData } from '../../store/DataContext'

const ESTADOS: EstadoPropiedad[] = ['Disponible', 'Alquilada', 'En venta', 'Suspendida', 'Vendida']
const TIPOS: TipoPropiedad[] = ['Departamento', 'Casa', 'PH', 'Local comercial', 'Oficina', 'Lote', 'Galpón']

// RF-02: transiciones válidas del ciclo de vida
const TRANSICIONES: Record<EstadoPropiedad, EstadoPropiedad[]> = {
  Disponible: ['Disponible', 'Alquilada', 'En venta', 'Suspendida'],
  Alquilada: ['Alquilada', 'Disponible', 'Suspendida'],
  'En venta': ['En venta', 'Vendida', 'Disponible', 'Suspendida'],
  Suspendida: ['Suspendida', 'Disponible', 'En venta'],
  Vendida: ['Vendida'],
}

type Paso = { tipo: 'form'; p?: Propiedad } | { tipo: 'confirmar'; p: Borrador; editando: boolean } | { tipo: 'eliminar'; p: Propiedad }
type Borrador = Omit<Propiedad, 'id' | 'creada'> & { id?: string }

export default function Propiedades() {
  const { propiedades, propietarios, contratos, guardarPropiedad, eliminarPropiedad } = useData()
  const mobile = useIsMobile()
  const [f, setF] = useState<'Todas' | EstadoPropiedad>('Todas')
  const [q, setQ] = useState('')
  const [paso, setPaso] = useState<Paso | null>(null)
  const [aviso, setAviso] = useState('')

  const owner = (id: string) => propietarios.find((o) => o.id === id)?.nombre ?? '—'
  const items = useMemo(() => {
    const t = q.trim().toLowerCase()
    return propiedades
      .filter((p) => f === 'Todas' || p.estado === f)
      .filter((p) => !t || `${p.titulo} ${p.direccion} ${p.barrio}`.toLowerCase().includes(t))
  }, [propiedades, f, q])

  const notificar = (m: string) => {
    setAviso(m)
    setTimeout(() => setAviso(''), 3500)
  }

  const nueva = () => setPaso({ tipo: 'form' })

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <AdminPageHead
        eyebrow={`${propiedades.length} propiedades registradas`}
        title={<>Cartera de <span className="gold">propiedades</span></>}
        action={!mobile && (
          <button type="button" className="btn btn-primary fz-in" style={{ animationDelay: '.15s' }} onClick={nueva}>
            <Icon name="plus" stroke="#E2C68F" width={2.4} /><Roll>Nueva propiedad</Roll>
          </button>
        )}
      />

      <div className="toolbar fz-in" style={{ marginBottom: 32, animationDelay: '.2s' }}>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar por título o dirección" />
        {mobile ? (
          <label className="select-inline" style={{ flex: '1 1 100%' }}>Estado
            <select value={f} onChange={(e) => setF(e.target.value as typeof f)}>{['Todas', ...ESTADOS].map((s) => <option key={s}>{s}</option>)}</select>
          </label>
        ) : (
          <Pills label="Estado" options={['Todas', ...ESTADOS] as const} value={f} onChange={setF} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: mobile ? 20 : '36px 24px' }}>
        {items.map((p) => (
          <article key={p.id} className="card-hover fz-reveal">
            <div style={{ position: 'relative', height: mobile ? 200 : 240, borderRadius: 18, overflow: 'hidden' }}>
              <Photo ph={p.ph} src={p.fotos[0]} zoom style={{ position: 'absolute', inset: 0 }} />
              <span style={{ position: 'absolute', left: 14, top: 14 }}><Estado value={p.estado} caps /></span>
              <span style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', gap: 8 }}>
                <button type="button" className="icon-btn" aria-label={`Editar ${p.titulo}`} onClick={() => setPaso({ tipo: 'form', p })}><Icon name="edit" size={16} /></button>
                <button type="button" className="icon-btn danger" aria-label={`Eliminar ${p.titulo}`} onClick={() => setPaso({ tipo: 'eliminar', p })}><Icon name="trash" size={16} /></button>
              </span>
            </div>
            <div style={{ padding: '16px 4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{p.titulo}</h2>
                <span style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }}>{precioPropiedad(p)}</span>
              </div>
              <p style={{ margin: '6px 0 12px', fontSize: 14, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="pin" size={14} stroke="#A9823C" />{p.direccion}, {p.barrio}</p>
              <div style={{ fontSize: 13, color: 'var(--text-2)', paddingTop: 12, borderTop: '1px solid var(--line)' }}>Propietario: <strong style={{ color: 'var(--navy)' }}>{owner(p.propietarioId)}</strong></div>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 56 }}>No hay propiedades con esos filtros.</div>}

      {mobile && <button type="button" className="fab" onClick={nueva}><Icon name="plus" stroke="#E2C68F" width={2.4} />Nueva</button>}

      {paso?.tipo === 'form' && (
        <PropiedadForm inicial={paso.p} onCancel={() => setPaso(null)} onSubmit={(b) => setPaso({ tipo: 'confirmar', p: b, editando: !!paso.p })} />
      )}

      {paso?.tipo === 'confirmar' && (
        <ConfirmDialog
          icon={paso.editando ? 'edit' : 'homePlus'}
          title={paso.editando ? <>¿Está seguro de <span className="gold">guardar</span> los cambios?</> : <>¿Está seguro de crear una <span className="gold">nueva</span> propiedad?</>}
          text={paso.p.estado === 'Disponible' || paso.p.estado === 'En venta' ? 'Se guardará en la cartera y, como está publicada, se verá en el catálogo web.' : 'Se guardará en la cartera. No se mostrará en el catálogo web por su estado.'}
          confirmLabel={paso.editando ? 'Sí, guardar cambios' : 'Sí, crear propiedad'}
          onCancel={() => setPaso({ tipo: 'form', p: paso.p as Propiedad })}
          onConfirm={() => {
            guardarPropiedad(paso.p)
            setPaso(null)
            notificar(paso.editando ? 'Cambios guardados.' : 'Propiedad creada.')
          }}
        >
          <ResumenPropiedad p={paso.p} owner={owner(paso.p.propietarioId)} />
        </ConfirmDialog>
      )}

      {paso?.tipo === 'eliminar' && (() => {
        const activos = contratos.filter((c) => c.propiedadId === paso.p.id && estadoContrato(c) !== 'Finalizado')
        return (
          <ConfirmDialog
            danger icon="trash"
            title={<>¿Está seguro de <span style={{ color: 'var(--danger)' }}>eliminar</span> esta propiedad?</>}
            text="Se dará de baja de la cartera y del catálogo web. Esta acción no se puede deshacer."
            confirmLabel="Sí, eliminar"
            onCancel={() => setPaso(null)}
            onConfirm={() => {
              if (activos.length) return
              eliminarPropiedad(paso.p.id)
              setPaso(null)
              notificar('Propiedad eliminada.')
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 16, padding: 10 }}>
              <Photo ph={paso.p.ph} src={paso.p.fotos[0]} style={{ flex: '0 0 96px', height: 80, borderRadius: 12 }} />
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{paso.p.titulo}</div>
                <div style={{ color: 'var(--muted)' }}>{paso.p.direccion} · Propietario: {owner(paso.p.propietarioId)}</div>
              </div>
              <Estado value={paso.p.estado} caps />
            </div>
            {activos.length ? (
              <p role="alert" style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--danger)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon name="alert" size={16} />Tiene un contrato vigente con {activos[0].inquilino.nombre}. Finalizalo antes de eliminarla.
              </p>
            ) : (
              <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--ok-fg)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon name="check" size={16} width={2.2} />No tiene contratos activos asociados
              </p>
            )}
          </ConfirmDialog>
        )
      })()}

      {aviso && <div className="toast" role="status"><Icon name="check" stroke="#E2C68F" />{aviso}</div>}
    </main>
  )
}

function ResumenPropiedad({ p, owner }: { p: Borrador; owner: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', marginBottom: 8 }}>
      <Photo ph={p.ph} src={p.fotos[0]} style={{ flex: '0 0 110px', borderRadius: 14, minHeight: 110 }} />
      <dl className="kv" style={{ flex: 1, minWidth: 0 }}>
        <div><dt>Propiedad</dt><dd>{p.titulo}</dd></div>
        <div><dt>Dirección</dt><dd style={{ fontWeight: 600 }}>{p.direccion}</dd></div>
        <div><dt>{p.operacion === 'Venta' ? 'Precio' : 'Alquiler'}</dt><dd>{precioPropiedad(p)}</dd></div>
        <div><dt>Propietario</dt><dd style={{ fontWeight: 600 }}>{owner}</dd></div>
        <div><dt>Estado</dt><dd><Estado value={p.estado} /></dd></div>
      </dl>
    </div>
  )
}

const PHS: Placeholder[] = ['ph-a', 'ph-b', 'ph-c', 'ph-d', 'ph-e']

function PropiedadForm({ inicial, onCancel, onSubmit }: { inicial?: Propiedad | Borrador; onCancel: () => void; onSubmit: (p: Borrador) => void }) {
  const { propietarios } = useData()
  const [operacion, setOperacion] = useState<Operacion>(inicial?.operacion ?? 'Alquiler')
  const [fotos, setFotos] = useState<string[]>(inicial?.fotos ?? [])
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string[]>([])
  const editando = !!inicial?.id
  const estados = inicial?.id ? TRANSICIONES[inicial.estado] : ESTADOS

  // Las fotos se guardan como data URL reducida para la demo; con el backend se suben a Storage
  const agregarFotos = async (files: FileList | null) => {
    if (!files) return
    const nuevas = await Promise.all([...files].filter((f) => f.type.startsWith('image/')).slice(0, 6).map(reducir))
    setFotos((x) => [...x, ...nuevas].slice(0, 6))
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    agregarFotos(e.dataTransfer.files)
  }

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const s = (k: string) => String(f.get(k) ?? '').trim()
    const num = (k: string) => Number(s(k).replace(/[^\d]/g, '')) || 0
    const faltan = [
      !s('titulo') && 'título', !s('direccion') && 'dirección', !s('propietarioId') && 'propietario',
      operacion === 'Alquiler' && !num('alquiler') && 'alquiler mensual', operacion === 'Venta' && !num('precioVenta') && 'precio de venta',
    ].filter(Boolean) as string[]
    if (faltan.length) {
      setError(faltan)
      return
    }
    onSubmit({
      ...(inicial ?? { caracteristicas: [], ph: PHS[Math.floor(Math.random() * PHS.length)] }),
      id: inicial?.id,
      titulo: s('titulo'), direccion: s('direccion'), barrio: s('barrio'), tipo: s('tipo') as TipoPropiedad,
      estado: s('estado') as EstadoPropiedad, operacion, m2: num('m2'), dormitorios: num('dormitorios'), banos: num('banos'),
      alquiler: operacion === 'Alquiler' ? num('alquiler') : undefined, precioVenta: operacion === 'Venta' ? num('precioVenta') : undefined,
      etapaVenta: operacion === 'Venta' ? (s('etapaVenta') as EtapaVenta) : undefined,
      propietarioId: s('propietarioId'), descripcion: s('descripcion'),
      caracteristicas: s('caracteristicas').split(',').map((x) => x.trim()).filter(Boolean),
      fotos,
    } as Borrador)
  }

  const inv = (k: string) => error.includes(k)

  return (
    <Modal onClose={onCancel} label={editando ? 'Editar propiedad' : 'Nueva propiedad'}>
      <div className="modal-head">
        <div>
          <p className="eyebrow line">{editando ? 'Edición de propiedad' : 'Alta de propiedad'}</p>
          <h1 className="modal-title"><span className="fz-line"><span>{editando ? 'Editar' : 'Nueva'} <span className="gold">propiedad</span></span></span></h1>
        </div>
        <CloseButton onClick={onCancel} />
      </div>
      <form className="form-grid" onSubmit={enviar} noValidate>
        <Field label="Título" required className="span-6" invalid={inv('título')}><input name="titulo" defaultValue={inicial?.titulo} placeholder="Ej.: Departamento en General Paz" /></Field>
        <Field label="Dirección" required className="span-4" invalid={inv('dirección')}><input name="direccion" defaultValue={inicial?.direccion} placeholder="Calle y número" /></Field>
        <Field label="Barrio" className="span-2"><input name="barrio" defaultValue={inicial?.barrio} placeholder="Nueva Córdoba" /></Field>
        <div className="span-6" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="small muted">Operación</span>
          <Pills label="Operación" options={['Alquiler', 'Venta'] as const} value={operacion} onChange={setOperacion} />
        </div>
        <Field label="Tipo" required className="span-2"><select name="tipo" defaultValue={inicial?.tipo ?? 'Departamento'}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Estado" required className="span-2">
          <select name="estado" defaultValue={inicial?.estado ?? (operacion === 'Venta' ? 'En venta' : 'Disponible')} key={operacion}>{estados.map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Propietario" required className="span-2" invalid={inv('propietario')}>
          <select name="propietarioId" defaultValue={inicial?.propietarioId ?? ''}>
            <option value="" disabled>Seleccionar</option>
            {propietarios.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </Field>
        <Field label="Superficie (m²)" className="span-2"><input name="m2" inputMode="numeric" defaultValue={inicial?.m2 || ''} placeholder="0" /></Field>
        <Field label="Dormitorios" className="span-2"><input name="dormitorios" inputMode="numeric" defaultValue={inicial?.dormitorios || ''} placeholder="0" /></Field>
        <Field label="Baños" className="span-2"><input name="banos" inputMode="numeric" defaultValue={inicial?.banos || ''} placeholder="0" /></Field>
        {operacion === 'Alquiler' ? (
          <Field label="Alquiler mensual ($)" required className="span-3" invalid={inv('alquiler mensual')}><input name="alquiler" inputMode="numeric" defaultValue={inicial?.alquiler || ''} placeholder="$" /></Field>
        ) : (
          <>
            <Field label="Precio de venta (USD)" required className="span-3" invalid={inv('precio de venta')}><input name="precioVenta" inputMode="numeric" defaultValue={inicial?.precioVenta || ''} placeholder="USD" /></Field>
            <Field label="Etapa de la venta" className="span-3"><select name="etapaVenta" defaultValue={inicial?.etapaVenta ?? 'Captación'}>{ETAPAS_VENTA.map((t) => <option key={t}>{t}</option>)}</select></Field>
          </>
        )}
        <Field label="Características (separadas por coma)" className={operacion === 'Alquiler' ? 'span-3' : 'span-6'}><input name="caracteristicas" defaultValue={inicial?.caracteristicas?.join(', ')} placeholder="Balcón, cochera, apto mascotas" /></Field>
        <Field label="Descripción" className="span-6"><textarea name="descripcion" rows={2} defaultValue={inicial?.descripcion} placeholder="Ambientes, orientación, amenities, requisitos" style={{ resize: 'none' }} /></Field>
        <label className={`dropzone span-6 ${drag ? 'drag' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => agregarFotos(e.target.files)} />
          <span className="avatar navy" style={{ flexBasis: 42, width: 42, height: 42 }}><Icon name="upload" /></span>
          <span>Arrastrá las fotos acá o <strong style={{ color: 'var(--navy)', borderBottom: '1px solid var(--gold)' }}>elegí archivos</strong> · JPG o PNG</span>
          {fotos.length > 0 && (
            <span className="thumbs" style={{ width: '100%', justifyContent: 'center' }}>
              {fotos.map((src, k) => (
                <span key={k} style={{ position: 'relative' }}>
                  <img src={src} alt={`Foto ${k + 1}`} />
                  <button type="button" aria-label={`Quitar foto ${k + 1}`} onClick={(e) => { e.preventDefault(); setFotos(fotos.filter((_, j) => j !== k)) }}
                    style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', border: 0, background: 'var(--navy)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
            </span>
          )}
        </label>
        {error.length > 0 && <p role="alert" className="field-error">Completá: {error.join(', ')}.</p>}
        <div className="form-footer">
          <span className="small muted"><span className="req">*</span> Campos obligatorios</span>
          <span className="btns">
            <button type="button" className="btn btn-outline" onClick={onCancel}><Roll>Cancelar</Roll></button>
            <button type="submit" className="btn btn-primary"><Roll>{editando ? 'Guardar cambios' : 'Crear propiedad'}</Roll><Icon name="arrowRight" size={16} /></button>
          </span>
        </div>
      </form>
    </Modal>
  )
}

function reducir(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const max = 1280
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
