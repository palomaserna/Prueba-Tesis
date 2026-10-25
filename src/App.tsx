import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { PwaStatus } from './components/PwaStatus'
import { LogoMark } from './components/ui'
import AdminLayout from './layouts/AdminLayout'
import PortalLayout from './layouts/PortalLayout'
import PublicLayout from './layouts/PublicLayout'
import { AuthProvider } from './store/AuthContext'
import { DataProvider } from './store/DataContext'

// Cada sección se descarga recién cuando se usa (RNF-04: carga en menos de 3 s)
const Inicio = lazy(() => import('./pages/public/Inicio'))
const Catalogo = lazy(() => import('./pages/public/Catalogo'))
const PropiedadDetalle = lazy(() => import('./pages/public/PropiedadDetalle'))
const Contacto = lazy(() => import('./pages/public/Contacto'))
const Login = lazy(() => import('./pages/auth/Login'))
const Recuperar = lazy(() => import('./pages/auth/Recuperar'))
const Panel = lazy(() => import('./pages/admin/Panel'))
const Propiedades = lazy(() => import('./pages/admin/Propiedades'))
const Contratos = lazy(() => import('./pages/admin/Contratos'))
const Cobros = lazy(() => import('./pages/admin/Cobros'))
const Consultas = lazy(() => import('./pages/admin/Consultas'))
const PortalInquilino = lazy(() => import('./pages/portal/PortalInquilino'))
const PortalPropietario = lazy(() => import('./pages/portal/PortalPropietario'))

function Cargando() {
  return (
    <div role="status" aria-label="Cargando" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
      <LogoMark size={40} />
    </div>
  )
}

function NoEncontrada() {
  return (
    <main className="container" style={{ paddingTop: 80, paddingBottom: 120, textAlign: 'center' }}>
      <p className="eyebrow" style={{ justifyContent: 'center' }}>Error 404</p>
      <h1 className="h1">Esta página no existe</h1>
      <p className="lead" style={{ margin: '16px 0 28px' }}>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </main>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Cargando />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Inicio />} />
                <Route path="catalogo" element={<Catalogo />} />
                <Route path="propiedad/:id" element={<PropiedadDetalle />} />
                <Route path="contacto" element={<Contacto />} />
                <Route path="*" element={<NoEncontrada />} />
              </Route>
              <Route path="login" element={<Login />} />
              <Route path="recuperar" element={<Recuperar />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Panel />} />
                <Route path="propiedades" element={<Propiedades />} />
                <Route path="contratos" element={<Contratos />} />
                <Route path="cobros" element={<Cobros />} />
                <Route path="consultas" element={<Consultas />} />
              </Route>
              <Route path="portal/inquilino" element={<PortalLayout rol="inquilino" />}>
                <Route index element={<PortalInquilino />} />
              </Route>
              <Route path="portal/propietario" element={<PortalLayout rol="propietario" />}>
                <Route index element={<PortalPropietario />} />
              </Route>
            </Routes>
          </Suspense>
          <PwaStatus />
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  )
}
