import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon'
import { Lines, MapaGoogle, Photo, Roll } from '../../components/ui'
import { useData } from '../../store/DataContext'

const MOTIVOS = ['Quiero alquilar', 'Quiero comprar', 'Quiero vender o alquilar mi propiedad', 'Solicitar una tasación', 'Administración de mi propiedad']

const INFO: { k: string; v: string; icon: IconName; href?: string }[] = [
  { k: 'Dirección', v: 'Rector León Morra 43, Córdoba', icon: 'pin' },
  { k: 'Teléfono / WhatsApp', v: '351 545 9999', icon: 'phone', href: 'https://wa.me/5493515459999' },
  { k: 'Instagram', v: '@futurainmobiliaria', icon: 'instagram' },
  { k: 'Facebook', v: 'Futura Servicios Inmobiliarios', icon: 'facebook' },
  { k: 'Horario', v: '[HORARIO DE ATENCIÓN]', icon: 'clock' },
]

export default function Contacto() {
  const { enviarConsulta } = useData()
  const [params] = useSearchParams()
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState('')
  const motivoInicial = params.get('motivo') === 'tasacion' ? 'Solicitar una tasación' : MOTIVOS[0]

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const nombre = String(f.get('nombre') || '').trim()
    const email = String(f.get('email') || '').trim()
    const telefono = String(f.get('telefono') || '').trim()
    const mensaje = String(f.get('mensaje') || '').trim()
    if (!nombre || (!email && !telefono) || !mensaje) {
      setError('Completá tu nombre, un email o teléfono y la consulta.')
      return
    }
    enviarConsulta({ nombre, email, telefono, motivo: String(f.get('motivo')), mensaje })
    setError('')
    setEnviada(true)
  }

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 100 }}>
      <p className="eyebrow line fz-in">Contacto</p>
      <h1 className="h1-xl" style={{ marginBottom: 56, maxWidth: 900 }}>
        <Lines lines={['Hablemos de tu', <><span className="gold">próxima</span> propiedad</>]} />
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'stretch' }}>
        <section className="card fz-in" aria-label="Enviar consulta" style={{ flex: '999 1 560px', minWidth: 0, padding: 'clamp(22px, 3.5vw, 48px)', animationDelay: '.2s' }}>
          {enviada ? (
            <div role="status" style={{ padding: '60px 0', textAlign: 'center' }}>
              <div className="confirm-icon fz-pop" style={{ width: 72, height: 72, margin: '0 auto 20px' }}><Icon name="check" size={30} width={2.2} /></div>
              <h2 style={{ margin: '0 0 10px', fontSize: 26 }}>¡Gracias por escribirnos!</h2>
              <p style={{ margin: '0 0 24px', color: 'var(--text-2)' }}>Recibimos tu consulta y te respondemos a la brevedad.</p>
              <button type="button" className="btn btn-outline" onClick={() => setEnviada(false)}>Nueva consulta</button>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate className="form-grid">
              <h2 className="span-6" style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>Enviar consulta</h2>
              <label className="field span-6"><span>Nombre y apellido</span><input name="nombre" type="text" placeholder="Tu nombre" autoComplete="name" /></label>
              <label className="field span-3"><span>Teléfono</span><input name="telefono" type="tel" placeholder="351 000 0000" autoComplete="tel" /></label>
              <label className="field span-3"><span>Email</span><input name="email" type="email" placeholder="nombre@mail.com" autoComplete="email" /></label>
              <label className="field span-6"><span>Motivo</span><select name="motivo" defaultValue={motivoInicial}>{MOTIVOS.map((m) => <option key={m}>{m}</option>)}</select></label>
              <label className="field span-6"><span>Consulta</span><textarea name="mensaje" rows={5} placeholder="Contanos qué estás buscando" /></label>
              {error && <p role="alert" className="field-error">{error}</p>}
              <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
                <div className="btns">
                  <button type="reset" className="btn btn-outline" onClick={() => setError('')}>Cancelar</button>
                  <button type="submit" className="btn btn-primary"><Roll>Enviar consulta</Roll></button>
                </div>
              </div>
            </form>
          )}
        </section>

        <aside className="fz-in" style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '.3s' }}>
          <div className="card pad-sm">
            <h2 style={{ margin: '16px 16px 8px', fontSize: 20, fontWeight: 700 }}>Información de contacto</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {INFO.map((c) => {
                const body = (
                  <>
                    <span className="avatar" style={{ flexBasis: 44, width: 44, height: 44 }}><Icon name={c.icon} stroke="#A9823C" width={1.9} /></span>
                    <span style={{ display: 'flex', flexDirection: 'column' }}><span className="label-caps">{c.k}</span><span style={{ fontSize: 16, fontWeight: 600 }}>{c.v}</span></span>
                  </>
                )
                const st = { display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', borderRadius: 14 }
                return <li key={c.k}>{c.href ? <a href={c.href} target="_blank" rel="noreferrer" style={st}>{body}</a> : <div style={st}>{body}</div>}</li>
              })}
            </ul>
          </div>
          <MapaGoogle direccion="Rector León Morra 43" etiqueta="Futura · Rector León Morra 43" height={300} />
        </aside>
      </div>

      <section className="fz-reveal" aria-label="Nuestra oficina" style={{ marginTop: 80 }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-.02em' }}>Visitá nuestra <span className="gold">oficina</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <Photo ph="ph-a" tag="Recepción" style={{ height: 260, borderRadius: 18 }} />
          <Photo ph="ph-d" tag="Oficina de dirección" style={{ height: 260, borderRadius: 18 }} />
          <Photo ph="ph-b" tag="Frente del local" style={{ height: 260, borderRadius: 18 }} />
        </div>
      </section>
    </main>
  )
}
