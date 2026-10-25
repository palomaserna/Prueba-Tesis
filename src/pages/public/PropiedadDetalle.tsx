import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Lines, MapaGoogle, Roll } from '../../components/ui'
import { precioPropiedad, whatsappLink } from '../../lib/format'
import { useData } from '../../store/DataContext'
import { TarjetaPropiedad, publicables } from './Catalogo'

const AMBIENTES = ['Living', 'Cocina', 'Dormitorio', 'Baño', 'Fachada', 'Detalle']

export default function PropiedadDetalle() {
  const { id } = useParams()
  const { propiedades, enviarConsulta } = useData()
  const p = propiedades.find((x) => x.id === id)
  const [i, setI] = useState(0)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState('')

  if (!p || !publicables([p]).length) {
    return (
      <main className="container" style={{ paddingTop: 80, paddingBottom: 120, textAlign: 'center' }}>
        <h1 className="h1">Esta propiedad ya no está publicada</h1>
        <p className="lead" style={{ margin: '16px 0 28px' }}>Puede que se haya alquilado o vendido.</p>
        <Link to="/catalogo" className="btn btn-primary">Ver catálogo</Link>
      </main>
    )
  }

  const fotos = p.fotos.length
    ? p.fotos.map((src, k) => ({ src, label: `Foto ${k + 1}`, ph: p.ph }))
    : AMBIENTES.map((label, k) => ({ src: '', label, ph: (['ph-a', 'ph-c', 'ph-d', 'ph-b', 'ph-c', 'ph-e'] as const)[(k + ['ph-a', 'ph-b', 'ph-c', 'ph-d', 'ph-e'].indexOf(p.ph)) % 6] }))
  const n = fotos.length
  const foto = fotos[i % n]
  const similares = publicables(propiedades).filter((x) => x.id !== p.id && (x.operacion === p.operacion || x.tipo === p.tipo)).slice(0, 3)
  const [l1, ...resto] = p.titulo.split(' ')
  const datos = [
    ['Operación', p.operacion], ['Tipo', p.tipo], ['Superficie', `${p.m2} m²`],
    ...(p.dormitorios ? [['Dormitorios', String(p.dormitorios)]] : []),
    ...(p.banos ? [['Baños', String(p.banos)]] : []),
    ['Estado', p.estado], ['Barrio', p.barrio],
  ]

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const nombre = String(f.get('nombre') || '').trim()
    const email = String(f.get('email') || '').trim()
    const telefono = String(f.get('telefono') || '').trim()
    if (!nombre || (!email && !telefono)) {
      setError('Dejanos tu nombre y un email o teléfono para responderte.')
      return
    }
    enviarConsulta({ nombre, email, telefono, propiedadId: p.id, mensaje: String(f.get('mensaje') || '') })
    setError('')
    setEnviada(true)
  }

  return (
    <main className="container" style={{ paddingTop: 20, paddingBottom: 100 }}>
      <nav aria-label="Ruta" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/catalogo" style={{ color: 'var(--muted)' }}>Catálogo</Link><span aria-hidden="true">/</span>
        <Link to={`/catalogo?op=${p.operacion}`} style={{ color: 'var(--muted)' }}>{p.operacion}</Link><span aria-hidden="true">/</span>
        <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{p.barrio}</span>
      </nav>

      {/* Galería numerada 01 / 06 */}
      <section aria-label="Galería" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 56 }}>
        <div style={{ flex: '999 1 640px', minWidth: 0, position: 'relative', height: 'clamp(300px, 46vw, 620px)', borderRadius: 24, overflow: 'hidden' }}>
          <div key={i} className={`fz-slide ${foto.src ? 'ph-photo' : foto.ph}`} style={{ position: 'absolute', inset: 0, backgroundImage: foto.src ? `url(${foto.src})` : undefined }} />
          {!foto.src && <span className="ph-tag" style={{ left: 20, bottom: 20 }}>Foto · {foto.label}</span>}
          <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(15,30,58,.85)', color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '.1em', padding: '10px 14px', borderRadius: 999 }}>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <button type="button" className="icon-btn" style={{ width: 52, height: 52 }} aria-label="Foto anterior" onClick={() => setI((i - 1 + n) % n)}><Icon name="arrowLeft" size={20} /></button>
            <button type="button" className="icon-btn" style={{ width: 52, height: 52 }} aria-label="Foto siguiente" onClick={() => setI((i + 1) % n)}><Icon name="arrowRight" size={20} /></button>
          </div>
        </div>
        <div style={{ flex: '1 1 200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, alignContent: 'start' }}>
          {fotos.map((t, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`Ver foto ${t.label}`} aria-pressed={k === i} className={t.src ? 'ph-photo' : t.ph}
              style={{ height: 92, border: 0, borderRadius: 14, cursor: 'pointer', opacity: k === i ? 1 : 0.55, outline: `2px solid ${k === i ? 'var(--gold)' : 'transparent'}`, outlineOffset: 2, backgroundImage: t.src ? `url(${t.src})` : undefined, transition: 'opacity .3s' }} />
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 56, alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 600px', minWidth: 0 }}>
          <p className="eyebrow line fz-in">{p.operacion} · {p.tipo}</p>
          <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(32px, 4vw, 54px)', lineHeight: 1.06, fontWeight: 700, letterSpacing: '-.02em' }}>
            <Lines lines={[<>{l1} <span className="gold">{resto.join(' ')}</span></>]} />
          </h1>
          <p className="fz-in" style={{ margin: '0 0 36px', fontSize: 16, color: 'var(--text-2)', display: 'flex', gap: 8, alignItems: 'center', animationDelay: '.2s' }}>
            <Icon name="pin" size={16} stroke="#A9823C" />{p.direccion}, {p.barrio}, Córdoba
          </p>

          <dl className="fz-reveal" style={{ margin: '0 0 48px', borderTop: '1px solid var(--navy)' }}>
            {datos.map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(0, 2fr)', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
                <dt style={{ fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', paddingTop: 3 }}>{k}</dt>
                <dd style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{v}</dd>
              </div>
            ))}
          </dl>

          {p.descripcion && (
            <section className="fz-reveal" style={{ marginBottom: 48 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 26, fontWeight: 700 }}>Descripción</h2>
              {p.descripcion.split('\n').filter(Boolean).map((t, k) => <p key={k} style={{ margin: '0 0 14px', fontSize: 17, lineHeight: 1.8, color: 'var(--text-2)' }}>{t}</p>)}
            </section>
          )}

          {p.caracteristicas.length > 0 && (
            <section className="fz-reveal" style={{ marginBottom: 48 }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 700 }}>Características</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {p.caracteristicas.map((x) => (
                  <li key={x} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 15, background: '#fff', borderRadius: 12, padding: '14px 16px' }}><Icon name="check" stroke="#A9823C" />{x}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="fz-reveal">
            <h2 style={{ margin: '0 0 18px', fontSize: 26, fontWeight: 700 }}>Ubicación</h2>
            <MapaGoogle direccion={`${p.direccion}, ${p.barrio}`} etiqueta={`${p.direccion} · ${p.barrio}`} />
          </section>
        </div>

        <aside style={{ flex: '1 1 360px', minWidth: 0, position: 'sticky', top: 20 }}>
          <div className="card fz-in" style={{ borderRadius: 22, padding: 30, animationDelay: '.3s' }}>
            <div className="label-caps" style={{ letterSpacing: '.18em' }}>{p.operacion === 'Venta' ? 'Precio de venta' : 'Alquiler mensual'}</div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-.02em', margin: '4px 0' }}>{precioPropiedad(p)}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', paddingBottom: 22, borderBottom: '1px solid var(--line-2)', marginBottom: 22 }}>
              {p.operacion === 'Venta' ? 'Comisión inmobiliaria 5 % · Apto escritura' : 'Actualización semestral · Contrato 24 meses'}
            </div>
            {enviada ? (
              <div role="status" style={{ textAlign: 'center', padding: '28px 8px' }}>
                <div className="confirm-icon fz-pop" style={{ margin: '0 auto 18px' }}><Icon name="check" size={28} width={2.2} /></div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>¡Consulta enviada!</h2>
                <p style={{ margin: '0 0 20px', color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6 }}>Te respondemos a la brevedad por email o WhatsApp.</p>
                <button type="button" className="btn btn-outline" onClick={() => setEnviada(false)}>Enviar otra consulta</button>
              </div>
            ) : (
              <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>
                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Consultar por esta propiedad</h2>
                <label className="field"><span>Nombre y apellido</span><input name="nombre" type="text" placeholder="Tu nombre" autoComplete="name" /></label>
                <label className="field"><span>Email</span><input name="email" type="email" placeholder="nombre@mail.com" autoComplete="email" /></label>
                <label className="field"><span>Teléfono</span><input name="telefono" type="tel" placeholder="351 000 0000" autoComplete="tel" /></label>
                <label className="field"><span>Mensaje</span><textarea name="mensaje" rows={4} defaultValue={`Hola, me interesa ${p.titulo.toLowerCase()} (${p.barrio}). ¿Podemos coordinar una visita?`} /></label>
                {error && <p role="alert" className="small" style={{ margin: 0, color: 'var(--danger)' }}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{ minHeight: 54 }}><Roll>Enviar consulta</Roll></button>
                <a href={whatsappLink(`Hola, me interesa la propiedad "${p.titulo}" (${p.direccion}).`)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14 }}>
                  <Icon name="whatsapp" />Escribir por WhatsApp
                </a>
              </form>
            )}
          </div>
        </aside>
      </div>

      {similares.length > 0 && (
        <section style={{ marginTop: 100 }}>
          <div className="fz-reveal between" style={{ marginBottom: 28 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-.02em' }}>Propiedades <span className="gold">similares</span></h2>
            <Link to="/catalogo" className="link-underline">Ver catálogo</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 24 }}>
            {similares.map((s) => <TarjetaPropiedad key={s.id} p={s} height={240} />)}
          </div>
        </section>
      )}
    </main>
  )
}
