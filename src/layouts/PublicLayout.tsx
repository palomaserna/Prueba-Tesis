import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Brand, LogoMark, Roll } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth, inicioDelRol } from '../store/AuthContext'

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/contacto', label: 'Contacto' },
]

export function PublicHeader() {
  const mobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const { usuario } = useAuth()
  const acceso = usuario ? { to: inicioDelRol(usuario.rol), label: 'Mi cuenta' } : { to: '/login', label: 'Iniciar sesión' }

  useEffect(() => {
    setOpen(false)
  }, [pathname, hash])

  return (
    <header className="container topbar">
      <Brand />
      {mobile ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={acceso.to} className="icon-btn" aria-label={acceso.label}><Icon name="user" /></Link>
          <button type="button" className="icon-btn" style={{ background: 'var(--navy)', color: '#fff' }} aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
        </div>
      ) : (
        <>
          <nav aria-label="Principal" className="nav">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive && !l.to.includes('#') ? 'active' : '')}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link to={acceso.to} className="btn btn-primary btn-sm" style={{ minHeight: 46 }}>
            <Icon name="user" size={16} />
            <Roll>{acceso.label}</Roll>
          </Link>
        </>
      )}

      {open && (
        <div className="menu-sheet" role="dialog" aria-modal="true" aria-label="Menú">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Brand light />
            <button type="button" className="icon-btn" aria-label="Cerrar menú" onClick={() => setOpen(false)}><Icon name="close" /></button>
          </div>
          <nav aria-label="Principal">
            {LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          </nav>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to={acceso.to} className="btn btn-white btn-block"><Icon name="user" />{acceso.label}</Link>
            <p style={{ margin: 0, fontSize: 13, color: '#C9D1DE', textAlign: 'center' }}>Rector León Morra 43, Córdoba · 351 545 9999</p>
          </div>
        </div>
      )}
    </header>
  )
}

export function FooterFull() {
  return (
    <footer className="footer">
      <div className="container" style={{ paddingTop: 72, paddingBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="brand" style={{ color: '#fff' }}>
            <LogoMark color="#C9A86A" door="#C9A86A" />
            <span className="brand-text"><b>FUTURA</b><small style={{ color: '#C9A86A' }}>SERVICIOS INMOBILIARIOS</small></span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>Ventas · Alquileres · Tasaciones · Administración de propiedades · Propiedad horizontal</p>
        </div>
        <FooterCol title="Contacto">Rector León Morra 43, Córdoba<br />351 545 9999<br />[EMAIL DE LA INMOBILIARIA]</FooterCol>
        <FooterCol title="Sitio"><Link to="/catalogo">Catálogo</Link><br /><Link to="/contacto">Contacto</Link><br /><Link to="/login">Acceso clientes</Link></FooterCol>
        <FooterCol title="Redes">Instagram<br />Facebook</FooterCol>
      </div>
      <div className="container" style={{ paddingTop: 22, paddingBottom: 22, borderTop: '1px solid rgba(221,226,234,.15)', fontSize: 12, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
        <span>© {new Date().getFullYear()} Futura Servicios Inmobiliarios</span>
        <span>Diana Lazarte · Martillero Corredor Inmobiliario</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: '1 1 160px', fontSize: 14, lineHeight: 2 }}>
      <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C9A86A', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

export function FooterCompact() {
  return (
    <footer className="footer">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
        <span style={{ fontWeight: 800, letterSpacing: '.22em', color: '#fff' }}>FUTURA</span>
        <span>Rector León Morra 43, Córdoba · 351 545 9999</span>
        <span>© {new Date().getFullYear()} Futura Servicios Inmobiliarios</span>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return (
    <div className="page">
      <PublicHeader />
      <Outlet />
      {pathname === '/' ? <FooterFull /> : <FooterCompact />}
    </div>
  )
}
