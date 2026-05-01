import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { getStagiaire } from '@/api/admin'
import { normalizeStagiaire } from '@/lib/normalizers'

export default function CvPrintPage() {
  const { id } = useParams()
  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin', 'stagiaire', Number(id)],
    queryFn: () => getStagiaire(Number(id)),
  })

  const stagiaire = raw ? normalizeStagiaire(raw) : null
  const cv = raw?.cv || null

  useEffect(() => {
    if (stagiaire && cv) {
      // Small delay to let rendering finish, then trigger print
      const t = setTimeout(() => window.print(), 300)
      return () => clearTimeout(t)
    }
  }, [stagiaire, cv])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    )
  }

  if (!stagiaire || !cv) {
    return (
      <div className="flex h-screen items-center justify-center text-ink-muted">
        CV introuvable pour ce stagiaire.
      </div>
    )
  }

  const profile = stagiaire.profile || {}
  const experiences = cv.experiences || []
  const educations = cv.educations || []
  const skills = cv.skills || []
  const languages = cv.languages || []
  const loisirs = (profile.loisirs || []).filter((l) => l?.label || l?.url)

  return (
    <div className="cv-print-root">
      <div className="cv-page">
        <div className="cv-grid-wrap">
          <header className="cv-topbar">
            <h1 className="cv-name">{stagiaire.full_name}</h1>
            <p className="cv-headline">{profile.filiere || ''}</p>
          </header>

          <div className="cv-grid">
            <aside className="cv-sidebar">
              <div className="cv-avatar">
                {stagiaire.full_name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>

              <p className="cv-pill">Informations</p>
              <div className="cv-contact">
                {profile.city && <p>Ville : {profile.city}</p>}
                <p>Téléphone : {stagiaire.phone || '—'}</p>
                <p>Email : {stagiaire.email || '—'}</p>
              </div>

              {skills.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-side-title">Compétences</h2>
                  <ul className="cv-list">
                    {skills.slice(0, 6).map((s, idx) => (
                      <li key={typeof s === 'string' ? `${s}-${idx}` : s.name || s.id}>
                        {typeof s === 'string' ? s : s.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.bio && (
                <div className="cv-section">
                  <h2 className="cv-side-title">Profil</h2>
                  <p className="cv-text">{profile.bio}</p>
                </div>
              )}
            </aside>

            <div className="cv-main">
              {educations.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Diplôme / Formation</h2>
                  {educations.map((e) => (
                    <article key={e.id} className="cv-entry">
                      <h3 className="cv-entry-title">{e.degree}</h3>
                      <p className="cv-entry-date">{fmtDate(e.start_date)}{e.end_date ? ` - ${fmtDate(e.end_date)}` : ''}</p>
                      <p className="cv-entry-sub">{e.school}</p>
                    </article>
                  ))}
                </div>
              )}

              {experiences.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Expérience</h2>
                  {experiences.map((e) => (
                    <article key={e.id} className="cv-entry">
                      <h3 className="cv-entry-date">{fmtDate(e.start_date)}{e.end_date ? ` - ${fmtDate(e.end_date)}` : ''}</h3>
                      <p className="cv-entry-sub">{e.position}{e.company ? ` — ${e.company}` : ''}</p>
                      {e.description && <p className="cv-text">{e.description}</p>}
                    </article>
                  ))}
                </div>
              )}

              {languages.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Langues</h2>
                  <ul className="cv-list">
                    {languages.map((l) => (
                      <li key={l.id || l.name}>{l.name}{l.level ? ` : ${l.level}` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}

              {loisirs.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Loisirs</h2>
                  <ul className="cv-list">
                    {loisirs.map((l, idx) => (
                      <li key={`${l.label || l.url}-${idx}`}>{l.label || l.url}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        .cv-print-root {
          font-family: 'Inter', system-ui, sans-serif;
          background: #fff;
          color: #1a1a1a;
        }

        .cv-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          box-sizing: border-box;
          overflow: hidden;
          break-after: page;
        }

        .cv-grid-wrap {
          min-height: 297mm;
        }

        .cv-topbar {
          border-bottom: 1px solid #c7d2fe;
          text-align: center;
          padding: 10mm 10mm 6mm;
        }

        .cv-grid {
          display: grid;
          grid-template-columns: 30% 1fr;
          min-height: calc(297mm - 34mm);
        }

        .cv-sidebar {
          border-right: 1px solid #c7d2fe;
          padding: 8mm 7mm;
          display: flex;
          flex-direction: column;
        }

        .cv-avatar {
          width: 64px;
          height: 64px;
          border-radius: 9999px;
          border: 2px solid #1e3a8a;
          background: #eff6ff;
          color: #1e3a8a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          margin: 0 auto;
        }

        .cv-name {
          font-size: 34px;
          font-weight: 600;
          line-height: 1.2;
          color: #1e3a8a;
        }

        .cv-headline {
          margin-top: 2px;
          font-size: 22px;
          color: #334155;
        }

        .cv-pill {
          margin-top: 5mm;
          border: 1px solid #1e3a8a;
          border-radius: 9999px;
          text-align: center;
          color: #1e3a8a;
          font-size: 14px;
          font-weight: 600;
          padding: 2mm 0;
        }

        .cv-contact {
          margin-top: 5mm;
          font-size: 14px;
          color: #1e293b;
          line-height: 1.8;
        }

        .cv-section { margin-top: 6mm; }

        .cv-side-title,
        .cv-main-title {
          border-bottom: 1px solid #1e3a8a;
          padding-bottom: 1mm;
          font-size: 24px;
          font-weight: 600;
          color: #1e3a8a;
        }

        .cv-list {
          margin-top: 6px;
          padding-left: 16px;
          font-size: 14px;
          color: #334155;
          line-height: 1.7;
        }

        .cv-main {
          padding: 8mm 7mm;
          display: flex;
          flex-direction: column;
          gap: 2mm;
        }

        .cv-text {
          margin-top: 4px;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
        }

        .cv-entry { margin-top: 3mm; }
        .cv-entry-title {
          font-size: 17px;
          font-weight: 600;
          color: #1e293b;
        }
        .cv-entry-date {
          font-size: 15px;
          color: #1e293b;
          flex-shrink: 0;
          font-weight: 600;
        }
        .cv-entry-sub {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
        }

        @media print {
          body { margin: 0; padding: 0; }
          .cv-print-root { background: #fff; }
          .cv-page {
            margin: 0;
            box-shadow: none;
          }
        }

        @media screen {
          body { background: #f5f5f5; }
          .cv-page {
            margin: 20px auto;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </div>
  )
}

function fmtDate(v) {
  if (!v) return ''
  const d = new Date(v)
  if (isNaN(d)) return v
  return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}
