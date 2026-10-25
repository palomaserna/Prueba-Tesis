// RF-15: autenticación por usuario y contraseña con acceso según el rol.
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Lines, LogoMark, Roll } from '../../components/ui'
import type { Rol } from '../../data/types'
import { inicioDelRol, useAuth } from '../../store/AuthContext'

export function AuthShell({ eyebrow, frase, children }: { eyebrow: string; frase: ReactNode; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexWrap: 'wrap', padding: 16, gap: 16 }}>
      <section aria-hidden="true" style={{ flex: '1 1 520px', minHeight: 'clamp(240px, 40vh, 420px)', borderRadius: 24, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(24px, 4vw, 40px)', color: '#fff' }}>
        <div className="ph-e" style={{ position: 'absolute', inset: 0, animation: 'fzZoomOut 2.4s var(--ease) both' }} />
        <style>{'@keyframes fzZoomOut{from{transform:scale(1.15)}to{transform:scale(1)}}'}</style>
        <svg viewBox="0 0 700 860" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <g fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.4">
            <path d="M120 860 V300 H560 V860" /><path d="M90 300 H590" />
            <path d="M120 380 H560 M120 460 H560 M120 540 H560 M120 620 H560 M120 700 H560 M120 780 H560" /><path d="M230 300 V860 M340 300 V860 M450 300 V860" />
          </g>
        </svg>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,20,40,.55) 0%, rgba(10,20,40,0) 40%, rgba(10,20,40,.75) 100%)' }} />
        <Link to="/" className="brand" style={{ position: 'relative', color: '#fff' }} tabIndex={-1}>
          <LogoMark color="#E2C68F" door="#E2C68F" />
          <span className="brand-text"><b>FUTURA</b><small style={{ color: '#E2C68F' }}>SERVICIOS INMOBILIARIOS</small></span>
        </Link>
        <div style={{ position: 'relative', maxWidth: 460 }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, letterSpacing: '.26em', textTransform: 'uppercase', color: '#E2C68F' }}>{eyebrow}</p>
          <p style={{ margin: 0, fontSize: 'clamp(24px, 2.6vw, 36px)', fontWeight: 600, lineHeight: 1.2 }}>{frase}</p>
        </div>
      </section>
      <section style={{ flex: '1 1 460px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 5vw, 72px) clamp(8px, 3vw, 40px)' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>{children}</div>
      </section>
    </div>
  )
}

const DEMO: [Rol, string][] = [['inquilino', 'Inquilino'], ['propietario', 'Propietario'], ['duena', 'Dueña'], ['secretaria', 'Secretaria']]

export default function Login() {
  const { usuario, ingresar, ingresarComo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [ver, setVer] = useState(false)
  const [error, setError] = useState('')
  const from = (location.state as { from?: string } | null)?.from

  if (usuario) return <Navigate to={inicioDelRol(usuario.rol)} replace />

  const entrar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      const u = ingresar(String(f.get('email')), String(f.get('password')), f.get('recordar') === 'on')
      navigate(from && from.startsWith(inicioDelRol(u.rol)) ? from : inicioDelRol(u.rol), { replace: true })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <AuthShell eyebrow="Acceso clientes y equipo" frase={<>Tu contrato, tus cobros y tus liquidaciones, <span style={{ color: '#E2C68F' }}>siempre a mano.</span></>}>
      <Link to="/" className="fz-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 40 }}>
        <Icon name="arrowLeft" size={16} />Volver al sitio
      </Link>
      <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(34px, 3.4vw, 46px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.08 }}>
        <Lines lines={[<>Inicio de <span className="gold">sesión</span></>]} />
      </h1>
      <p className="fz-in" style={{ margin: '0 0 36px', fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6, animationDelay: '.1s' }}>Ingresá con el usuario que te dio la inmobiliaria.</p>

      <form className="fz-in" onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 14, animationDelay: '.2s' }}>
        <label className={`field ${error ? 'invalid' : ''}`}><span>Correo electrónico</span>
          <input name="email" type="email" required placeholder="nombre@mail.com" autoComplete="username" style={{ fontSize: 16 }} onChange={() => setError('')} />
        </label>
        <div className={`field ${error ? 'invalid' : ''}`} style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Contraseña</span>
            <input name="password" type={ver ? 'text' : 'password'} required autoComplete="current-password" style={{ border: 0, font: 'inherit', fontSize: 16, outline: 'none', color: 'var(--navy)', background: 'transparent' }} onChange={() => setError('')} />
          </label>
          <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={ver ? 'eyeOff' : 'eye'} size={20} width={1.9} />
          </button>
        </div>
        {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--danger)' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', minHeight: 44 }}>
            <input name="recordar" type="checkbox" style={{ width: 18, height: 18, accentColor: 'var(--navy)' }} />Recordarme
          </label>
          <Link to="/recuperar" style={{ fontWeight: 600, borderBottom: '1px solid var(--gold)' }}>¿Olvidaste la contraseña?</Link>
        </div>
        <button type="submit" className="btn btn-primary" style={{ minHeight: 56, fontSize: 16, marginTop: 6 }}>
          <Roll>Iniciar sesión</Roll><Icon name="arrowRight" />
        </button>
      </form>

      <div className="fz-in" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--line)', animationDelay: '.3s' }}>
        <p className="label-caps" style={{ margin: '0 0 12px', letterSpacing: '.18em' }}>Prototipo · entrar como</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {DEMO.map(([rol, l]) => (
            <button key={rol} type="button" className="btn btn-sm" style={{ border: '1px solid var(--line)', background: 'transparent', borderRadius: 12, color: 'var(--navy)' }} onClick={() => navigate(inicioDelRol(ingresarComo(rol).rol))}>
              {l}
            </button>
          ))}
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>¿Sos cliente y no tenés usuario? Pedilo en la oficina o al 351 545 9999.</p>
      </div>
    </AuthShell>
  )
}
