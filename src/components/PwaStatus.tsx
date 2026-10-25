// Avisos de la PWA: nueva versión disponible, lista para usar sin conexión,
// sin conexión a Internet y botón para instalar la app.
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Icon } from './Icon'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    listeners.forEach((l) => l())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    listeners.forEach((l) => l())
  })
}

/** Botón "Instalar app" (Chrome / Edge en compu y Android). */
export function useInstall() {
  const can = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => deferred !== null,
    () => false,
  )
  const instalar = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    deferred = null
    listeners.forEach((l) => l())
  }
  return { puedeInstalar: can, instalar }
}

export function InstallButton({ compact = false }: { compact?: boolean }) {
  const { puedeInstalar, instalar } = useInstall()
  if (!puedeInstalar) return null
  return (
    <button type="button" className={compact ? 'icon-btn' : 'btn btn-white btn-sm'} onClick={instalar} aria-label="Instalar la app">
      <Icon name="install" />
      {!compact && 'Instalar app'}
    </button>
  )
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function PwaStatus() {
  const online = useOnline()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!offlineReady) return
    const t = setTimeout(() => setOfflineReady(false), 5000)
    return () => clearTimeout(t)
  }, [offlineReady, setOfflineReady])

  return (
    <>
      {!online && (
        <div className="offline-bar" role="status" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90 }}>
          Sin conexión · Estás viendo la última información guardada
        </div>
      )}
      {needRefresh && (
        <div className="toast" role="status">
          <Icon name="refresh" />
          Hay una versión nueva del sistema.
          <button type="button" className="btn btn-white" onClick={() => updateServiceWorker(true)}>Actualizar</button>
          <button type="button" className="icon-btn" style={{ background: 'transparent', color: '#fff' }} aria-label="Cerrar" onClick={() => setNeedRefresh(false)}>
            <Icon name="close" />
          </button>
        </div>
      )}
      {offlineReady && !needRefresh && (
        <div className="toast" role="status">
          <Icon name="check" stroke="#E2C68F" />
          Listo: la app ya funciona sin conexión.
        </div>
      )}
    </>
  )
}
