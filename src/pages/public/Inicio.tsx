import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Lines, LogoMark, Photo, Pills, Roll } from '../../components/ui'
import type { Operacion, Propiedad } from '../../data/types'
import { precioPropiedad } from '../../lib/format'
import { useData } from '../../store/DataContext'
import { publicables } from './Catalogo'

// La pantalla de carga se muestra una vez por sesión
let loaderVisto = false
try {
  loaderVisto = sessionStorage.getItem('futura-loader') === '1'
  sessionStorage.setItem('futura-loader', '1')
} catch {
  /* sin almacenamiento */
}

const PASOS = [
  ['Consulta inicial', 'Nos contás qué buscás: tipo de propiedad, zona, presupuesto y fecha. Por WhatsApp, teléfono o en la oficina.'],
  ['Selección de opciones', 'Filtramos la cartera activa y te presentamos las propiedades que coinciden, con fotos y valores.'],
  ['Visita acompañada', 'Coordinamos la visita con el propietario y te acompañamos para responder cada consulta.'],
  ['Documentación', 'Verificamos DNI, ingresos y garantía o seguro de caución. Te avisamos si falta algo.'],
  ['Firma y seguimiento', 'Firmamos el contrato y seguimos acompañando: vencimientos, aumentos y cobros desde tu portal.'],
]

export default function Inicio() {
  const { propiedades, contratos } = useData()
  const navigate = useNavigate()
  const [op, setOp] = useState<Operacion>('Alquiler')
  const [tipo, setTipo] = useState('Departamento')
  const [barrio, setBarrio] = useState('')
  const [i, setI] = useState(0)
  const d = loaderVisto ? 0 : 2.4 // demora de las animaciones si hay pantalla de carga

  const visibles = publicables(propiedades)
  const destacadas = visibles.filter((p) => p.destacada).concat(visibles.filter((p) => !p.destacada)).slice(0, 4)
  const n = Math.max(1, destacadas.length)
  const barrios = [...new Set(visibles.map((p) => p.barrio))].sort()
  const porTipo = (t: string[]) => visibles.filter((p) => t.includes(p.tipo)).length

  const stats = [
    { n: String(new Date().getFullYear() - 2001), suf: '+', label: 'años de trayectoria en el mercado cordobés' },
    { n: String(contratos.filter((c) => !c.finalizado).length), suf: '', label: 'contratos de alquiler activos' },
    { n: String(propiedades.filter((p) => p.estado === 'En venta').length), suf: '', label: 'propiedades en venta en cartera' },
    { n: '420', suf: '', label: 'cobros de alquiler gestionados por año' },
  ]
  const tipos = [
    { name: 'Departamentos', q: 'Departamento', count: porTipo(['Departamento', 'PH']), ph: 'ph-a' as const },
    { name: 'Casas', q: 'Casa', count: porTipo(['Casa']), ph: 'ph-d' as const },
    { name: 'Locales comerciales', q: 'Local comercial', count: porTipo(['Local comercial', 'Oficina', 'Galpón']), ph: 'ph-b' as const },
    { name: 'Lotes', q: 'Lote', count: porTipo(['Lote']), ph: 'ph-c' as const },
  ]

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({ op, tipo, ...(barrio ? { barrio } : {}) })
    navigate(`/catalogo?${q}`)
  }

  return (
    <main style={{ position: 'relative' }}>
      {!loaderVisto && <Loader />}

      {/* Portada */}
      <section aria-label="Portada" className="container">
        <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', minHeight: 640, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--navy)' }}>
          <div className="fz-par ph-e" style={{ position: 'absolute', inset: 0 }}>
            <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
              <g fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.4">
                <path d="M560 520 H1180" /><path d="M600 520 V330 H1120 V520" /><path d="M570 330 H1160" /><path d="M640 330 V250 H980 V330" />
                <path d="M620 250 H1010" /><path d="M700 520 V400 H820 V520" /><path d="M860 400 H1060 V470 H860 Z" /><path d="M680 280 H940" /><path d="M680 300 H940" /><path d="M1000 330 V520" />
              </g>
              <g fill="rgba(255,255,255,.08)"><rect x="860" y="400" width="200" height="70" /><rect x="700" y="400" width="120" height="120" /></g>
            </svg>
          </div>
          <div className="fz-leaves" aria-hidden="true" style={{ position: 'absolute', inset: '-10%', pointerEvents: 'none', opacity: 0.5, filter: 'blur(10px)', background: 'radial-gradient(60px 120px at 78% 22%, rgba(15,30,58,.55), transparent 70%), radial-gradient(90px 50px at 86% 30%, rgba(15,30,58,.45), transparent 70%), radial-gradient(70px 140px at 92% 12%, rgba(15,30,58,.5), transparent 70%), radial-gradient(110px 60px at 70% 8%, rgba(15,30,58,.4), transparent 70%)' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,20,40,.82) 0%, rgba(10,20,40,.45) 45%, rgba(10,20,40,0) 75%)' }} />
          <div style={{ position: 'relative', padding: 'clamp(28px, 5vw, 72px)', maxWidth: 720, color: '#fff' }}>
            <p className="fz-in" style={{ margin: '0 0 22px', fontSize: 12, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--gold-light)', animationDelay: `${d}s` }}>Córdoba · Desde 2001</p>
            <h1 style={{ margin: 0, fontSize: 'clamp(40px, 5.4vw, 76px)', lineHeight: 1.02, fontWeight: 700, letterSpacing: '-.02em' }}>
              <Lines delay={d + 0.1} lines={['Propiedades para', 'vivir, invertir y', <span className="gold" style={{ color: 'var(--gold-light)' }}>crecer.</span>]} />
            </h1>
            <p className="fz-in" style={{ margin: '26px 0 34px', fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,.86)', maxWidth: 520, animationDelay: `${d + 0.5}s` }}>
              Alquileres, ventas, tasaciones y administración de propiedades con atención personal, de principio a fin.
            </p>
            <div className="fz-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, animationDelay: `${d + 0.6}s` }}>
              <Link to="/catalogo" className="btn btn-white"><Roll>Ver catálogo</Roll><Icon name="arrowRight" size={16} /></Link>
              <Link to="/contacto?motivo=tasacion" className="btn btn-ghost-light"><Roll>Tasá tu propiedad</Roll></Link>
            </div>
          </div>

          <form className="fz-in" aria-label="Buscar propiedades" onSubmit={buscar} style={{ position: 'relative', margin: '0 clamp(16px, 3vw, 40px) clamp(16px, 3vw, 40px)', background: '#fff', borderRadius: 18, padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'stretch', animationDelay: `${d + 0.7}s`, boxShadow: '0 20px 50px rgba(10,20,40,.25)' }}>
            <Pills label="Operación" options={['Alquiler', 'Venta'] as const} value={op} onChange={setOp} />
            <label style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px 16px', borderLeft: '1px solid var(--line-2)' }}>
              <span className="label-caps" style={{ fontSize: 11 }}>Tipo</span>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ border: 0, font: 'inherit', fontSize: 15, fontWeight: 600, color: 'var(--navy)', background: 'transparent', padding: '4px 0' }}>
                <option>Departamento</option><option>Casa</option><option>PH</option><option>Local comercial</option><option>Oficina</option><option>Lote</option>
              </select>
            </label>
            <label style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px 16px', borderLeft: '1px solid var(--line-2)' }}>
              <span className="label-caps" style={{ fontSize: 11 }}>Barrio</span>
              <select value={barrio} onChange={(e) => setBarrio(e.target.value)} style={{ border: 0, font: 'inherit', fontSize: 15, fontWeight: 600, color: 'var(--navy)', background: 'transparent', padding: '4px 0' }}>
                <option value="">Todos</option>
                {barrios.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <button type="submit" className="btn btn-primary" style={{ minHeight: 56, borderRadius: 12, padding: '0 28px', flex: '0 0 auto' }}>
              <Icon name="search" /><Roll>Buscar</Roll>
            </button>
          </form>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="container" style={{ paddingTop: 120, paddingBottom: 40, display: 'flex', flexWrap: 'wrap', gap: 56, alignItems: 'flex-start', scrollMarginTop: 20 }}>
        <div className="fz-reveal" style={{ flex: '1 1 420px' }}>
          <p className="eyebrow line">Sobre nosotros</p>
          <h2 className="h2" style={{ marginBottom: 22 }}>Más de dos décadas <span className="gold">cuidando</span> propiedades en Córdoba</h2>
          <p className="lead" style={{ maxWidth: 560 }}>Futura nació en 2001 de la mano de Diana Lazarte. Hoy acompañamos a propietarios, inversores y familias en cada etapa: desde la tasación y la publicación hasta la firma del contrato, el cobro mensual y la liquidación.</p>
        </div>
        <div style={{ flex: '1 1 460px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {stats.map((s) => (
            <div key={s.label} className="fz-reveal" style={{ padding: '28px 24px 28px 0', borderTop: '1px solid var(--line)' }}>
              <div style={{ fontSize: 'clamp(44px, 4.4vw, 64px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>{s.n}<span className="gold">{s.suf}</span></div>
              <div style={{ marginTop: 10, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Destacadas: carrusel con barra de progreso */}
      <section aria-label="Propiedades destacadas" className="container" style={{ paddingTop: 80, paddingBottom: 40, overflow: 'hidden' }}>
        <div className="fz-reveal between" style={{ marginBottom: 36 }}>
          <div>
            <p className="eyebrow line">Selección</p>
            <h2 className="h2">Propiedades <span className="gold">destacadas</span></h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.08em', color: 'var(--muted)' }}>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <button type="button" className="icon-btn lg" aria-label="Anterior" onClick={() => setI((i - 1 + n) % n)}><Icon name="arrowLeft" size={20} /></button>
            <button type="button" className="icon-btn lg" aria-label="Siguiente" onClick={() => setI((i + 1) % n)}><Icon name="arrowRight" size={20} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, transform: `translateX(calc(${-i} * (min(88%, 1040px) + 32px)))`, transition: 'transform .9s var(--ease)' }}>
          {destacadas.map((f, k) => <Destacada key={f.id} p={f} activa={k === i} />)}
        </div>
        <div style={{ margin: '44px auto 0', maxWidth: 1100, height: 3, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'var(--gold)', width: `${((i + 1) / n) * 100}%`, transition: 'width .9s var(--ease)' }} />
        </div>
      </section>

      {/* Por tipo */}
      <section id="servicios" className="container" style={{ paddingTop: 100, paddingBottom: 40, scrollMarginTop: 20 }}>
        <div className="fz-reveal" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Nuestra cartera</p>
          <h2 className="h2" style={{ marginBottom: 16 }}>Explorá por <span className="gold">tipo</span> de propiedad</h2>
          <p className="lead">Residencial y comercial, para alquilar o comprar. Todo publicado con fotos, precio y ubicación.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {tipos.map((t) => (
            <Link key={t.name} to={`/catalogo?tipo=${encodeURIComponent(t.q)}`} className="card-hover fz-reveal" style={{ display: 'block' }}>
              <div style={{ position: 'relative', height: 340, borderRadius: 18, overflow: 'hidden' }}>
                <div className={`ph-img ${t.ph}`} style={{ position: 'absolute', inset: 0 }} />
                <span style={{ position: 'absolute', left: 16, top: 16, display: 'flex', gap: 6 }}>
                  <span className="badge caps" style={{ background: 'rgba(255,255,255,.9)' }}>Alquiler</span>
                  <span className="badge caps" style={{ background: 'rgba(255,255,255,.9)' }}>Venta</span>
                </span>
                <span className="go icon-btn" style={{ position: 'absolute', right: 16, bottom: 16, width: 46, height: 46 }}><Icon name="arrowUpRight" /></span>
              </div>
              <div style={{ padding: '16px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>{t.name}</span>
                <span className="small muted">{t.count} disponibles</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Córdoba */}
      <section aria-hidden="true" style={{ position: 'relative', padding: '110px 0 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', fontSize: 'clamp(90px, 17vw, 260px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 0.8, color: '#E6E6E1', userSelect: 'none' }}>CÓRDOBA</div>
        <div className="container" style={{ maxWidth: 1100, marginTop: -80, position: 'relative' }}>
          <div style={{ height: 300, borderRadius: 22, overflow: 'hidden', position: 'relative', boxShadow: '0 40px 80px rgba(15,30,58,.18)' }}>
            <div className="fz-par ph-b" style={{ position: 'absolute', inset: 0 }} />
            <svg viewBox="0 0 1100 300" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <g fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.3"><path d="M60 250 H1040" /><path d="M120 250 V140 H980 V250" /><path d="M90 140 H1010" /><path d="M200 140 V250 M360 140 V250 M540 140 V250 M720 140 V250 M880 140 V250" /><path d="M120 180 H980" /></g>
            </svg>
          </div>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="container" style={{ paddingTop: 120, paddingBottom: 40, display: 'flex', flexWrap: 'wrap', gap: 56 }}>
        <div className="fz-reveal" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <p className="eyebrow line">Proceso</p>
            <h2 className="h2" style={{ marginBottom: 14 }}>Cómo <span className="gold">trabajamos</span></h2>
            <p className="lead" style={{ maxWidth: 460 }}>Un proceso simple y transparente, desde la primera consulta hasta que recibís las llaves.</p>
          </div>
          <div style={{ position: 'relative', flex: '1 1 auto', minHeight: 420, borderRadius: 22, overflow: 'hidden' }}>
            <div className="fz-par ph-a" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', right: 22, top: 22, width: 132, height: 132, borderRadius: '50%', background: 'rgba(15,30,58,.86)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 13, fontWeight: 600, lineHeight: 1.35, padding: 18 }}>Atención personal de la dueña</div>
          </div>
        </div>
        <ol style={{ flex: '1 1 480px', listStyle: 'none', margin: 0, padding: 0 }}>
          {PASOS.map(([t, desc], k) => (
            <li key={t} className="fz-reveal" style={{ display: 'flex', gap: 22, padding: '28px 0', borderBottom: '1px solid var(--line)' }}>
              <span className="avatar navy" style={{ flex: '0 0 52px', width: 52, height: 52, fontSize: 14 }}>{String(k + 1).padStart(2, '0')}</span>
              <div><h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>{t}</h3><p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)' }}>{desc}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* Marquesina */}
      <section aria-label="Galería" style={{ padding: '100px 0 40px', overflow: 'hidden' }}>
        <div className="fz-marquee" style={{ display: 'flex', gap: 20, width: 'max-content' }}>
          {[...visibles.slice(0, 6), ...visibles.slice(0, 6)].map((p, k) => (
            <Link to={`/propiedad/${p.id}`} key={k} style={{ width: 320, flex: '0 0 auto' }} tabIndex={k >= 6 ? -1 : undefined} aria-hidden={k >= 6 ? true : undefined}>
              <figure style={{ margin: 0 }}>
                <Photo ph={p.ph} src={p.fotos[0]} style={{ height: 220, borderRadius: 16 }} />
                <figcaption style={{ paddingTop: 12, fontSize: 13, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{p.titulo}</span><span>{p.barrio}</span>
                </figcaption>
              </figure>
            </Link>
          ))}
        </div>
      </section>

      {/* Tasaciones */}
      <section className="container" style={{ paddingTop: 100, paddingBottom: 120, display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
        <div className="fz-reveal" style={{ flex: '1 1 420px' }}>
          <h2 style={{ margin: '0 0 28px', fontSize: 'clamp(40px, 4.6vw, 66px)', fontWeight: 400, letterSpacing: '.14em', lineHeight: 1.12, textTransform: 'uppercase' }}>Tasá tu<br /><span className="gold">propiedad</span></h2>
          <p style={{ margin: '0 0 36px', fontSize: 18, lineHeight: 1.75, color: 'var(--text-2)', maxWidth: 500 }}>Relevamos superficie, estado y ubicación, analizamos el mercado de la zona y te entregamos un informe con el valor estimado de venta o alquiler.</p>
          <Link to="/contacto?motivo=tasacion" className="btn btn-outline" style={{ padding: '0 44px', minHeight: 64, fontSize: 14, letterSpacing: '.2em' }}><Roll>Solicitar tasación</Roll></Link>
        </div>
        <Photo ph="ph-c" tag="Interior luminoso" className="fz-reveal" style={{ flex: '1 1 460px', height: 560, borderRadius: 4 }} />
      </section>
    </main>
  )
}

function Destacada({ p, activa }: { p: Propiedad; activa: boolean }) {
  return (
    <article className="card-hover" style={{ flex: '0 0 min(88%, 1040px)', display: 'flex', flexWrap: 'wrap', background: '#fff', borderRadius: 20, overflow: 'hidden', opacity: activa ? 1 : 0.4, transition: 'opacity .9s var(--ease)' }} aria-hidden={!activa}>
      <div style={{ flex: '1 1 380px', minHeight: 'clamp(260px, 40vw, 420px)', position: 'relative', overflow: 'hidden' }}>
        <div className={`ph-img ${p.fotos[0] ? 'ph-photo' : p.ph}`} style={{ position: 'absolute', inset: 0, backgroundImage: p.fotos[0] ? `url(${p.fotos[0]})` : undefined }} />
        <span className="badge caps b-navy" style={{ position: 'absolute', left: 18, top: 18 }}>{p.operacion}</span>
      </div>
      <div style={{ flex: '1 1 380px', padding: 'clamp(24px, 4vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, background: '#F8F9FA' }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-dark)' }}>{p.barrio} · {p.operacion}</p>
        <h3 style={{ margin: 0, fontSize: 'clamp(26px, 2.6vw, 38px)', lineHeight: 1.12, fontWeight: 700, letterSpacing: '-.02em' }}>{p.titulo}</h3>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)' }}>{p.descripcion.split('\n')[0]}</p>
        <Specs p={p} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="label-caps" style={{ letterSpacing: '.1em' }}>{p.operacion === 'Venta' ? 'Precio de venta' : 'Alquiler mensual'}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{precioPropiedad(p)}</div>
          </div>
          <Link to={`/propiedad/${p.id}`} className="btn btn-primary" tabIndex={activa ? undefined : -1}><Roll>Ver propiedad</Roll></Link>
        </div>
      </div>
    </article>
  )
}

export function Specs({ p }: { p: Propiedad }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, fontSize: 14, padding: '16px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="area" stroke="#A9823C" width={1.8} />{p.m2} m²</span>
      {p.dormitorios > 0 && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="bed" stroke="#A9823C" width={1.8} />{p.dormitorios} dorm.</span>}
      {p.banos > 0 && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="bath" stroke="#A9823C" width={1.8} />{p.banos} {p.banos > 1 ? 'baños' : 'baño'}</span>}
    </div>
  )
}

function Loader() {
  return (
    <div className="loader" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--navy)', color: 'var(--ground)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px var(--gutter)', animation: 'fzLoaderOut 1s cubic-bezier(.77,0,.175,1) 2.3s forwards' }}>
      <style>{`@keyframes fzLoaderOut{to{transform:translateY(-100%);visibility:hidden}}
@keyframes fzLoadBar{from{width:0}to{width:100%}}
@property --fzn{syntax:'<integer>';initial-value:0;inherits:false}
.fz-count{animation:fzCount 2.1s cubic-bezier(.25,1,.5,1) forwards;counter-reset:n var(--fzn)}
.fz-count::after{content:counter(n, decimal-leading-zero)}
@keyframes fzCount{to{--fzn:100}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-soft)' }}><span>Futura</span><span>Córdoba · AR</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <LogoMark size={64} color="#C9A86A" door="#C9A86A" />
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '.32em', paddingLeft: '.32em' }}>FUTURA</div>
        <div style={{ fontSize: 11, letterSpacing: '.38em', color: 'var(--gold-soft)' }}>SERVICIOS INMOBILIARIOS</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase' }}><span>Cargando</span><span><span className="fz-count" style={{ fontSize: 44, fontWeight: 300, letterSpacing: 0 }} />%</span></div>
        <div style={{ height: 1, background: 'rgba(243,243,241,.2)' }}><div style={{ height: 1, background: 'var(--gold-soft)', animation: 'fzLoadBar 2.1s cubic-bezier(.25,1,.5,1) forwards' }} /></div>
      </div>
    </div>
  )
}
