// Sistema interno (Dueña y Secretaria).
// Compu: barra superior con menú. Celular: barra superior compacta + barra inferior de pestañas.
import { useEffect } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { InstallButton } from '../components/PwaStatus'
import { Brand } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { estadoCobro, periodoActual } from '../lib/negocio'
import { iniciales } from '../lib/format'
import { nombreRol, useAuth } from '../store/AuthContext'
import { useData } from '../store/DataContext'

interface Item { to: string; label: string; icon: IconName; count?: number; tone?: 'danger' | 'warn' }

export function useAdminNav(): Item[] {
  const { cobros, consultas } = useData()
  const mora = cobros.filter((c) => c.periodo <= periodoActual() && estadoCobro(c) === 'En mora').length
  const nuevas = consultas.filter((q) => q.estado === 'Nueva').length
  return [
    { to: '/admin', label: 'Inicio', icon: 'grid' },
    { to: '/admin/propiedades', label: 'Propiedades', icon: 'building' },
    { to: '/admin/contratos', label: 'Contratos', icon: 'file' },
    { to: '/admin/cobros', label: 'Cobros', icon: 'wallet', count: mora, tone: 'danger' },
    { to: '/admin/consultas', label: 'Consultas', icon: 'message', count: nuevas, tone: 'warn' },
  ]
}

export default function AdminLayout() {
  const { usuario, salir } = useAuth()
  const nav = useAdminNav()
  const mobile = useIsMobile()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (!usuario) return <Navigate to="/login" replace state={{ from: pathname }} />
  if (usuario.rol !== 'duena' && usuario.rol !== 'secretaria') return <Navigate to="/" replace />

  const cerrar = () => {
    salir()
    navigate('/login')
  }

  const chip = (
    <span className="user-chip">
      <span className="avatar navy">{iniciales(usuario.nombre)}</span>
      <span>
        <b>{usuario.nombre}</b>
        <small>{nombreRol[usuario.rol]}</small>
      </span>
    </span>
  )

  return (
    <div className={`page ${mobile ? 'has-bottom-nav' : ''}`}>
      <header className="container topbar">
        <Brand to="/admin" sub="ADMINISTRACIÓN" />
        {!mobile && (
          <nav aria-label="Sistema" className="nav">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
                {!!n.count && (
                  <span className="count" style={{ background: n.tone === 'danger' ? 'var(--danger-bg)' : 'var(--warn-bg)', color: n.tone === 'danger' ? 'var(--danger-fg)' : 'var(--warn-fg)' }}>{n.count}</span>
                )}
              </NavLink>
            ))}
          </nav>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <InstallButton compact={mobile} />
          {!mobile && chip}
          {mobile && <span className="avatar navy" title={usuario.nombre}>{iniciales(usuario.nombre)}</span>}
          <button type="button" className="icon-btn" aria-label="Cerrar sesión" onClick={cerrar} style={{ width: 46, height: 46 }}>
            <Icon name="logout" />
          </button>
        </div>
      </header>

      <Outlet />

      {mobile && (
        <nav className="bottom-nav" aria-label="Sistema">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={n.icon} size={22} width={1.8} />
              {n.label}
              {!!n.count && <span className="dot-count" style={n.tone === 'warn' ? { background: 'var(--gold)' } : undefined}>{n.count}</span>}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}

export function AdminPageHead({ eyebrow, title, action }: { eyebrow: React.ReactNode; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="between" style={{ marginBottom: 32 }}>
      <div>
        <p className="eyebrow line fz-in">{eyebrow}</p>
        <h1 className="h1"><span className="fz-line"><span>{title}</span></span></h1>
      </div>
      {action}
    </div>
  )
}

export function BackToAdmin() {
  return <Link to="/admin" className="small muted">← Volver al inicio</Link>
}
