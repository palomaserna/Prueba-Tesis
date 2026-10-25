// RF-13: catálogo público, navegable sin registro (RNF-07).
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Lines, Pills, SearchBox } from '../../components/ui'
import type { Propiedad } from '../../data/types'
import { precioPropiedad } from '../../lib/format'
import { useData } from '../../store/DataContext'

// eslint-disable-next-line react-refresh/only-export-components
export const publicables = (ps: Propiedad[]) => ps.filter((p) => p.estado === 'Disponible' || p.estado === 'En venta')

const POR_PAGINA = 9
type Op = 'Todas' | 'Alquiler' | 'Venta'
const TIPOS = ['Todos', 'Departamento', 'Casa', 'PH', 'Local comercial', 'Oficina', 'Lote']

export default function Catalogo() {
  const { propiedades } = useData()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [orden, setOrden] = useState('recientes')
  const op = (params.get('op') as Op) || 'Todas'
  const tipo = params.get('tipo') || 'Todos'
  const barrio = params.get('barrio') || ''
  const pagina = Number(params.get('p') || 1)

  const set = (k: string, v: string, def: string) => {
    const next = new URLSearchParams(params)
    if (v === def) next.delete(k)
    else next.set(k, v)
    next.delete('p')
    setParams(next, { replace: true })
  }

  const items = useMemo(() => {
    const texto = q.trim().toLowerCase()
    const precio = (p: Propiedad) => (p.operacion === 'Venta' ? (p.precioVenta ?? 0) * 1200 : p.alquiler ?? 0)
    return publicables(propiedades)
      .filter((p) => op === 'Todas' || p.operacion === op)
      .filter((p) => tipo === 'Todos' || p.tipo === tipo)
      .filter((p) => !barrio || p.barrio === barrio)
      .filter((p) => !texto || `${p.titulo} ${p.direccion} ${p.barrio}`.toLowerCase().includes(texto))
      .sort((a, b) => (orden === 'menor' ? precio(a) - precio(b) : orden === 'mayor' ? precio(b) - precio(a) : b.creada.localeCompare(a.creada)))
  }, [propiedades, op, tipo, barrio, q, orden])

  const paginas = Math.max(1, Math.ceil(items.length / POR_PAGINA))
  const visibles = items.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const irA = (n: number) => {
    const next = new URLSearchParams(params)
    next.set('p', String(n))
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 100 }}>
      <div className="between" style={{ marginBottom: 40, gap: 24 }}>
        <div>
          <p className="eyebrow line fz-in">Catálogo público</p>
          <h1 className="h1-xl"><Lines lines={['Encontrá tu próxima', <span className="gold">propiedad</span>]} /></h1>
        </div>
        <p className="fz-in lead" style={{ fontSize: 16, maxWidth: 420, animationDelay: '.2s' }}>Sin registrarte: mirá fotos, precio y ubicación, y escribinos por la que te interese.</p>
      </div>

      <div className="toolbar fz-in" style={{ marginBottom: 18, animationDelay: '.25s' }}>
        <SearchBox value={q} onChange={setQ} placeholder="Buscar por título, barrio o dirección" />
        <Pills label="Operación" options={['Todas', 'Alquiler', 'Venta'] as const} value={op} onChange={(v) => set('op', v, 'Todas')} />
        <label className="select-inline">Tipo
          <select value={tipo} onChange={(e) => set('tipo', e.target.value, 'Todos')}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="select-inline">Ordenar
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option><option value="menor">Menor precio</option><option value="mayor">Mayor precio</option>
          </select>
        </label>
      </div>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--muted)' }}>
        <strong style={{ color: 'var(--navy)' }}>{items.length}</strong> propiedades disponibles
        {barrio && <> en <strong style={{ color: 'var(--navy)' }}>{barrio}</strong> · <button type="button" onClick={() => set('barrio', '', '')} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', color: 'var(--muted)' }}>quitar barrio</button></>}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '36px 24px' }}>
        {visibles.map((p) => <TarjetaPropiedad key={p.id} p={p} />)}
      </div>
      {items.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 56 }}>
          No hay propiedades con esos filtros. <Link to="/contacto" style={{ fontWeight: 600, borderBottom: '1px solid var(--gold)' }}>Contanos qué buscás</Link> y te avisamos.
        </div>
      )}

      {paginas > 1 && (
        <nav aria-label="Páginas" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 64 }}>
          {Array.from({ length: paginas }, (_, k) => k + 1).map((n) => (
            <button key={n} type="button" onClick={() => irA(n)} aria-current={n === pagina ? 'page' : undefined} className="icon-btn" style={{ width: 48, height: 48, fontWeight: 600, ...(n === pagina ? { background: 'var(--navy)', color: '#fff' } : {}) }}>{n}</button>
          ))}
          {pagina < paginas && <button type="button" className="icon-btn" style={{ width: 48, height: 48 }} aria-label="Página siguiente" onClick={() => irA(pagina + 1)}><Icon name="arrowRight" /></button>}
        </nav>
      )}
    </main>
  )
}

export function TarjetaPropiedad({ p, height = 290 }: { p: Propiedad; height?: number }) {
  return (
    <Link to={`/propiedad/${p.id}`} className="card-hover fz-reveal" style={{ display: 'block' }}>
      <div style={{ position: 'relative', height, borderRadius: 18, overflow: 'hidden' }}>
        <div className={`ph-img ${p.fotos[0] ? 'ph-photo' : p.ph}`} style={{ position: 'absolute', inset: 0, backgroundImage: p.fotos[0] ? `url(${p.fotos[0]})` : undefined }} />
        <span style={{ position: 'absolute', left: 14, top: 14, display: 'flex', gap: 6 }}>
          <span className="badge caps b-navy">{p.operacion}</span>
          <span className="badge caps" style={{ background: 'rgba(255,255,255,.9)' }}>{p.tipo}</span>
        </span>
        <span className="go icon-btn" style={{ position: 'absolute', right: 14, bottom: 14, width: 46, height: 46 }}><Icon name="arrowUpRight" /></span>
      </div>
      <div style={{ padding: '18px 4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, lineHeight: 1.3 }}>{p.titulo}</h2>
          <span style={{ fontSize: 19, fontWeight: 700, whiteSpace: 'nowrap' }}>{precioPropiedad(p)}</span>
        </div>
        <p style={{ margin: '6px 0 14px', fontSize: 14, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="pin" size={14} stroke="#A9823C" />{p.direccion}, {p.barrio}
        </p>
        <div style={{ display: 'flex', gap: 18, fontSize: 13, color: 'var(--text-2)', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <span>{p.m2} m²</span>
          <span>{p.dormitorios ? `${p.dormitorios} dorm.` : p.tipo === 'Departamento' ? 'Monoamb.' : '—'}</span>
          <span>{p.banos ? `${p.banos} ${p.banos > 1 ? 'baños' : 'baño'}` : '—'}</span>
        </div>
      </div>
    </Link>
  )
}
