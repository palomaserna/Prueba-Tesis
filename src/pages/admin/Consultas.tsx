// RF-14: consultas enviadas desde el catálogo web y el formulario de contacto.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Estado, Pills } from '../../components/ui'
import type { Consulta, EstadoConsulta } from '../../data/types'
import { fecha, whatsappLink } from '../../lib/format'
import { hoy, toISO } from '../../lib/negocio'
import { AdminPageHead } from '../../layouts/AdminLayout'
import { useData } from '../../store/DataContext'

type Filtro = 'Todas' | EstadoConsulta

function cuando(iso: string) {
  const d = iso.slice(0, 10)
  const h = iso.slice(11, 16)
  const ayer = new Date(hoy())
  ayer.setDate(ayer.getDate() - 1)
  if (d === toISO(hoy())) return `Hoy · ${h}`
  if (d === toISO(ayer)) return `Ayer · ${h}`
  return fecha(d)
}

const telWa = (t: string) => '549' + t.replace(/\D/g, '').replace(/^0/, '')

export default function Consultas() {
  const { consultas, propiedades, cambiarEstadoConsulta } = useData()
  const [f, setF] = useState<Filtro>('Todas')
  const items = [...consultas].sort((a, b) => b.fecha.localeCompare(a.fecha)).filter((q) => f === 'Todas' || q.estado === f)
  const prop = (q: Consulta) => propiedades.find((p) => p.id === q.propiedadId)

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <AdminPageHead
        eyebrow="Desde el catálogo web"
        title={<>Consultas <span className="gold">recibidas</span></>}
        action={<div className="fz-in" style={{ animationDelay: '.15s' }}><Pills onWhite label="Estado" options={[['Todas', 'Todas'], ['Nueva', 'Nuevas'], ['Respondida', 'Respondidas'], ['Cerrada', 'Cerradas']] as const} value={f} onChange={setF} /></div>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((q) => {
          const p = prop(q)
          const texto = `Hola ${q.nombre.split(' ')[0]}, te escribimos de Futura por tu consulta${p ? ` sobre "${p.titulo}"` : ''}.`
          return (
            <article key={q.id} className="card fz-in" style={{ padding: 'clamp(18px, 2.4vw, 28px)', display: 'flex', flexWrap: 'wrap', gap: 22, opacity: q.estado === 'Cerrada' ? 0.6 : 1 }}>
              <div style={{ flex: '999 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                  {q.estado === 'Nueva' && <span aria-hidden="true" className="fz-pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />}
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{q.nombre}</h2>
                  <Estado value={q.estado} />
                  <span className="small muted" style={{ marginLeft: 'auto' }}>{cuando(q.fecha)}</span>
                </div>
                {p ? (
                  <Link to={`/propiedad/${p.id}`} style={{ fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 600 }}>{p.titulo} · {p.barrio}</Link>
                ) : (
                  <span style={{ fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 600 }}>{q.motivo ?? 'Consulta general'}</span>
                )}
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#2C3647' }}>“{q.mensaje}”</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, color: 'var(--text-2)', paddingTop: 10, borderTop: '1px solid var(--line-3)' }}>
                  {q.email && <a href={`mailto:${q.email}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Icon name="mail" size={15} stroke="#A9823C" />{q.email}</a>}
                  {q.telefono && <a href={`tel:${q.telefono.replace(/\s/g, '')}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Icon name="phone" size={15} stroke="#A9823C" />{q.telefono}</a>}
                </div>
              </div>
              <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                {q.telefono && (
                  <a href={whatsappLink(texto, telWa(q.telefono))} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ minHeight: 48, fontSize: 14 }} onClick={() => q.estado === 'Nueva' && cambiarEstadoConsulta(q.id, 'Respondida')}>
                    <Icon name="whatsapp" size={16} stroke="#E2C68F" />Responder por WhatsApp
                  </a>
                )}
                <button type="button" className="btn btn-outline" style={{ minHeight: 46, fontSize: 12 }} disabled={q.estado !== 'Nueva'} onClick={() => cambiarEstadoConsulta(q.id, 'Respondida')}>Marcar respondida</button>
                <button type="button" className="btn btn-outline" style={{ minHeight: 46, fontSize: 12, color: 'var(--muted)', borderColor: 'var(--line-2)' }} onClick={() => cambiarEstadoConsulta(q.id, q.estado === 'Cerrada' ? 'Nueva' : 'Cerrada')}>
                  {q.estado === 'Cerrada' ? 'Reabrir consulta' : 'Cerrar consulta'}
                </button>
              </div>
            </article>
          )
        })}
        {items.length === 0 && <div className="card" style={{ padding: 56, textAlign: 'center', color: 'var(--muted)' }}>No hay consultas en este estado.</div>}
      </div>
    </main>
  )
}
