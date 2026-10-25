// Piezas visuales reutilizadas en todas las pantallas.
import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { EstadoCobro, EstadoConsulta, EstadoContrato, EstadoPropiedad, Placeholder } from '../data/types'
import { Icon, type IconName } from './Icon'

/* ---------- Marca ---------- */
export function LogoMark({ size = 34, color = '#0F1E3A', door = '#A9823C' }: { size?: number; color?: string; door?: string }) {
  return (
    <svg width={size} height={(size * 56) / 64} viewBox="0 0 64 56" fill="none" stroke={color} strokeWidth={3} aria-hidden="true">
      <path d="M4 30 L32 6 L60 30" />
      <path d="M12 24 V52 H52 V24" />
      <path d="M26 52 V36 H38 V52" stroke={door} />
    </svg>
  )
}

export function Brand({ to = '/', sub = 'SERVICIOS INMOBILIARIOS', light = false }: { to?: string; sub?: string; light?: boolean }) {
  return (
    <Link to={to} className="brand" style={light ? { color: '#fff' } : undefined} aria-label="Futura · inicio">
      <LogoMark color={light ? '#E2C68F' : '#0F1E3A'} door={light ? '#E2C68F' : '#A9823C'} />
      <span className="brand-text">
        <b>FUTURA</b>
        <small style={light ? { color: '#E2C68F' } : undefined}>{sub}</small>
      </span>
    </Link>
  )
}

/* ---------- Texto animado ---------- */
/** Cada línea sube desde una máscara (movimiento 2 del diseño). */
export function Lines({ lines, delay = 0, step = 0.12 }: { lines: ReactNode[]; delay?: number; step?: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <span className="fz-line" key={i}>
          <span style={{ animationDelay: `${delay + i * step}s` }}>{l}</span>
        </span>
      ))}
    </>
  )
}

/** Texto de botón que "rueda" hacia arriba al pasar el mouse. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  )
}

export function Eyebrow({ children, line = true, style }: { children: ReactNode; line?: boolean; style?: CSSProperties }) {
  return <p className={`eyebrow fz-in ${line ? 'line' : ''}`} style={style}>{children}</p>
}

/* ---------- Fotos ---------- */
export function Photo({ ph, src, tag, className = '', style, zoom = false }: { ph: Placeholder; src?: string; tag?: string; className?: string; style?: CSSProperties; zoom?: boolean }) {
  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div
        className={`${zoom ? 'ph-img ' : ''}${src ? 'ph-photo' : ph}`}
        style={{ position: 'absolute', inset: 0, backgroundImage: src ? `url(${src})` : undefined }}
        role={src ? 'img' : undefined}
        aria-label={src ? tag : undefined}
      />
      {tag && !src && <span className="ph-tag">Foto · {tag}</span>}
    </div>
  )
}

/* ---------- Estados ---------- */
const TONO: Record<string, string> = {
  Disponible: 'b-ok', Alquilada: 'b-white', 'En venta': 'b-warn', Suspendida: 'b-neutral', Vendida: 'b-navy',
  Activo: 'b-ok', 'Por vencer': 'b-warn', Finalizado: 'b-neutral',
  Pagado: 'b-ok', 'Pago c/ recargo': 'b-info', Pendiente: 'b-warn', 'En mora': 'b-danger',
  Nueva: 'b-warn', Respondida: 'b-ok', Cerrada: 'b-neutral',
}
export function Estado({ value, caps = false, className = '' }: { value: EstadoPropiedad | EstadoContrato | EstadoCobro | EstadoConsulta; caps?: boolean; className?: string }) {
  return <span className={`badge dot ${caps ? 'caps' : ''} ${TONO[value] ?? 'b-neutral'} ${className}`}>{value}</span>
}

/* ---------- Filtros ---------- */
export function Pills<T extends string>({ options, value, onChange, label, onWhite = false, stretch = false }: {
  options: readonly (T | [T, string])[]
  value: T
  onChange: (v: T) => void
  label: string
  onWhite?: boolean
  stretch?: boolean
}) {
  return (
    <div role="group" aria-label={label} className={`pill-group ${onWhite ? 'on-white' : ''} ${stretch ? 'stretch' : ''}`}>
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o]
        return (
          <button key={v} type="button" className="pill" aria-pressed={value === v} onClick={() => onChange(v)}>
            {l}
          </button>
        )
      })}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="search">
      <Icon name="search" stroke="#5B6475" />
      <span className="sr-only">Buscar</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  )
}

/* ---------- Campos ---------- */
export function Field({ label, required, className = '', invalid, readOnly, children }: { label: string; required?: boolean; className?: string; invalid?: boolean; readOnly?: boolean; children: ReactNode }) {
  return (
    <label className={`field ${readOnly ? 'readonly' : ''} ${invalid ? 'invalid' : ''} ${className}`}>
      <span>
        {label} {required && <span className="req">*</span>}
      </span>
      {children}
    </label>
  )
}

/* ---------- Modal accesible ---------- */
export function Modal({ onClose, children, width = 860, label, role = 'dialog', split = false }: {
  onClose: () => void
  children: ReactNode
  width?: number
  label: string
  role?: 'dialog' | 'alertdialog' | 'status'
  split?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current
    el?.querySelector<HTMLElement>('input, select, textarea, button, a[href]')?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    el?.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      el?.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.({ preventScroll: true })
    }
  }, [])
  return (
    <div className="veil" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section ref={ref} className={`modal ${split ? 'split' : ''}`} role={role} aria-modal="true" aria-label={label} style={{ maxWidth: width }}>
        {children}
      </section>
    </div>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn soft" aria-label="Cerrar" onClick={onClick}>
      <Icon name="close" />
    </button>
  )
}

/** "¿Está seguro…?" — confirmación previa a crear, editar o eliminar. */
export function ConfirmDialog({ title, text, icon = 'check', danger = false, eyebrow, confirmLabel, onConfirm, onCancel, children }: {
  title: ReactNode
  text: string
  icon?: IconName
  danger?: boolean
  eyebrow?: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}) {
  const id = useId()
  return (
    <Modal onClose={onCancel} width={540} label={typeof title === 'string' ? title : 'Confirmación'} role="alertdialog">
      <div aria-describedby={id}>
        <div className={`confirm-icon ${danger ? 'danger fz-shake' : 'fz-pop'}`}>
          <Icon name={icon} size={28} />
        </div>
        <p className="eyebrow" style={{ color: danger ? 'var(--danger)' : undefined }}>{eyebrow ?? (danger ? 'Eliminar' : 'Confirmación')}</p>
        <h1 className="confirm-title">{title}</h1>
        <p id={id} style={{ margin: '0 0 22px', fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)' }}>{text}</p>
        {children}
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            <Roll>Cancelar</Roll>
          </button>
          <button type="button" className={`btn grow ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            <Roll>{confirmLabel}</Roll>
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------- Mapa (Google Maps, RF-13) ---------- */
export function MapaGoogle({ direccion, etiqueta, height = 380 }: { direccion: string; etiqueta?: string; height?: number | string }) {
  const q = encodeURIComponent(`${direccion}, Córdoba, Argentina`)
  return (
    <div className="map-frame" style={{ height }}>
      <iframe title={`Mapa: ${direccion}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`} />
      {etiqueta && <span className="map-label">{etiqueta}</span>}
    </div>
  )
}

/** Imprime solo el elemento indicado (recibos, planilla de cobros). */
export function imprimir(el: HTMLElement | null) {
  if (!el) return
  el.classList.add('print-target')
  const fin = () => {
    el.classList.remove('print-target')
    window.removeEventListener('afterprint', fin)
  }
  window.addEventListener('afterprint', fin)
  window.print()
}
