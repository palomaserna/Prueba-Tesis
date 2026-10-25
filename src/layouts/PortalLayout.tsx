// Portales de clientes (Inquilino y Propietario) — RF-12.
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { InstallButton } from '../components/PwaStatus'
import { Brand } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../store/AuthContext'

export default function PortalLayout({ rol }: { rol: 'inquilino' | 'propietario' }) {
  const { usuario, salir } = useAuth()
  const mobile = useIsMobile()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!usuario) return <Navigate to="/login" replace state={{ from: pathname }} />
  if (usuario.rol !== rol) return <Navigate to="/" replace />

  const cerrar = () => {
    salir()
    navigate('/login')
  }
  const titulo = rol === 'inquilino' ? 'Mi información' : 'Mis propiedades'

  return (
    <div className={`page ${mobile ? 'has-bottom-nav' : ''}`}>
      <header className="container topbar">
        <Brand to={pathname} sub={rol === 'inquilino' ? 'PORTAL DEL INQUILINO' : 'PORTAL DEL PROPIETARIO'} />
        {mobile ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <InstallButton compact />
            <button type="button" className="icon-btn" aria-label="Cerrar sesión" onClick={cerrar}><Icon name="logoutAlt" /></button>
          </div>
        ) : (
          <nav aria-label="Portal" className="nav" style={{ alignItems: 'center' }}>
            <NavLink to={pathname} className="active" aria-current="page">{titulo}</NavLink>
            <NavLink to="/" end>Página web</NavLink>
            <InstallButton />
            <a href="#salir" onClick={(e) => { e.preventDefault(); cerrar() }}><Icon name="logoutAlt" size={16} />Cerrar sesión</a>
          </nav>
        )}
      </header>
      <Outlet />
      {mobile && (
        <nav className="bottom-nav" aria-label="Portal">
          <NavLink to={pathname} className="active"><Icon name={rol === 'inquilino' ? 'home' : 'building'} size={22} width={1.8} />{titulo}</NavLink>
          <NavLink to="/catalogo"><Icon name="search" size={22} width={1.8} />Catálogo</NavLink>
          <a href="https://wa.me/5493515459999" target="_blank" rel="noreferrer"><Icon name="whatsapp" size={22} width={1.8} />WhatsApp</a>
        </nav>
      )}
    </div>
  )
}
