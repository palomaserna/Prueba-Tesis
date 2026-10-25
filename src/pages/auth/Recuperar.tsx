import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Lines, Roll } from '../../components/ui'
import { AuthShell } from './Login'

// Con el backend: supabase.auth.resetPasswordForEmail(email)
export default function Recuperar() {
  const [enviado, setEnviado] = useState(false)
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }
  return (
    <AuthShell eyebrow="Acceso seguro" frase={<>Tus datos protegidos, <span style={{ color: '#E2C68F' }}>siempre.</span></>}>
      <Link to="/login" className="fz-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 40 }}>
        <Icon name="arrowLeft" size={16} />Volver al inicio de sesión
      </Link>
      {enviado ? (
        <div role="status">
          <div className="confirm-icon fz-pop" style={{ width: 76, height: 76, marginBottom: 28 }}><Icon name="mail" size={32} /></div>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(34px, 3.4vw, 46px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.08 }}>
            <Lines lines={[<>Revisá tu <span className="gold">correo</span></>]} />
          </h1>
          <p className="fz-in" style={{ margin: '0 0 32px', fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6 }}>Si el correo está registrado, vas a recibir un enlace válido por 30 minutos. Revisá también la carpeta de correo no deseado.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/login" className="btn btn-primary"><Roll>Volver a ingresar</Roll></Link>
            <button type="button" className="btn btn-outline" onClick={() => setEnviado(false)}>Reenviar</button>
          </div>
        </div>
      ) : (
        <>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(34px, 3.4vw, 46px)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.08 }}>
            <Lines step={0.1} lines={['Recuperar', <span className="gold">contraseña</span>]} />
          </h1>
          <p className="fz-in" style={{ margin: '0 0 32px', fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6, animationDelay: '.15s' }}>Ingresá el correo con el que te registró la inmobiliaria y te enviamos un enlace para crear una nueva.</p>
          <form className="fz-in" onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14, animationDelay: '.2s' }}>
            <label className="field"><span>Correo electrónico</span><input type="email" required placeholder="nombre@mail.com" autoComplete="email" style={{ fontSize: 16 }} /></label>
            <button type="submit" className="btn btn-primary" style={{ minHeight: 56, fontSize: 16 }}><Roll>Enviar enlace</Roll></button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
