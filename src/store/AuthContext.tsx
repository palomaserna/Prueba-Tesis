// Sesión de la demo. Con el backend, `ingresar` llama a
// supabase.auth.signInWithPassword y el rol sale de la tabla de usuarios (RF-15).
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { PASSWORD_DEMO, usuariosDemo } from '../data/mock'
import type { Rol, Usuario } from '../data/types'

const KEY = 'futura-sesion'

interface AuthApi {
  usuario: Usuario | null
  ingresar: (email: string, password: string, recordar?: boolean) => Usuario
  ingresarComo: (rol: Rol) => Usuario
  salir: () => void
}

const Ctx = createContext<AuthApi | null>(null)

function leer(): Usuario | null {
  try {
    const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

export const inicioDelRol = (rol: Rol) =>
  rol === 'inquilino' ? '/portal/inquilino' : rol === 'propietario' ? '/portal/propietario' : '/admin'

export const nombreRol: Record<Rol, string> = {
  duena: 'Administradora',
  secretaria: 'Secretaria',
  inquilino: 'Inquilino',
  propietario: 'Propietario',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leer)

  const guardar = useCallback((u: Usuario, recordar: boolean) => {
    try {
      ;(recordar ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(u))
    } catch {
      /* sin almacenamiento */
    }
    setUsuario(u)
    return u
  }, [])

  const ingresar = useCallback(
    (email: string, password: string, recordar = false) => {
      const u = usuariosDemo.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
      if (!u || password !== PASSWORD_DEMO) throw new Error('El correo o la contraseña no son correctos.')
      return guardar(u, recordar)
    },
    [guardar],
  )

  const ingresarComo = useCallback((rol: Rol) => guardar(usuariosDemo.find((x) => x.rol === rol)!, false), [guardar])

  const salir = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY)
      localStorage.removeItem(KEY)
    } catch {
      /* nada */
    }
    setUsuario(null)
  }, [])

  const api = useMemo(() => ({ usuario, ingresar, ingresarComo, salir }), [usuario, ingresar, ingresarComo, salir])
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return v
}
