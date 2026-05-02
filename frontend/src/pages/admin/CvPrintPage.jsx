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
  const profile = stagiaire?.profile || {}

  useEffect(() => {
    if (stagiaire && cv) {
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

  const experiences = cv.experiences || []
  const educations = cv.educations || []
  const skills = cv.skills || []
  const languages = cv.languages || []
  const certifications = cv.certifications || []
  const loisirs = (profile.loisirs || []).filter((l) => l?.label || l?.url)
  const fullName = stagiaire.full_name || ''
  const headline = cv.headline || profile.filiere || ''
  const photoUrl = profile.photo_path || null
  const age = getAge(profile.birth_date)
  const address = profile.city || ''
  const phone = stagiaire.phone || ''
  const email = stagiaire.email || ''
  const summary = cv.summary || profile.bio || ''

  return (
    <div className="cv-print-root">
      <div className="cv-page">
        <div className="cv-inner">
          <header className="cv-header">
            <h1 className="cv-name">{fullName}</h1>
            <p className="cv-headline">{headline}</p>
          </header>

          <div className="cv-body">
            <aside className="cv-sidebar">
              <div className="cv-photo-wrap">
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo" className="cv-photo" />
                ) : (
                  <div className="cv-initials">
                    {fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                )}
              </div>

              <div className="cv-info">
                {age !== null && (
                  <div className="cv-info-item">
                    <p className="cv-info-label">Âge</p>
                    <p className="cv-info-value">{age} ans</p>
                  </div>
                )}
                {address && (
                  <div className="cv-info-item">
                    <p className="cv-info-label">Adresse</p>
                    <p className="cv-info-value cv-break">{address}, Maroc</p>
                  </div>
                )}
                {phone && (
                  <div className="cv-info-item">
                    <p className="cv-info-label">Numéro</p>
                    <p className="cv-info-value cv-break">{phone}</p>
                  </div>
                )}
                {email && (
                  <div className="cv-info-item">
                    <p className="cv-info-label">Email</p>
                    <p className="cv-info-value cv-break">{email}</p>
                  </div>
                )}
                {summary && (
                  <div className="cv-info-item">
                    <p className="cv-info-label">Profil</p>
                    <p className="cv-info-value cv-break">{summary}</p>
                  </div>
                )}
              </div>

              {skills.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-side-title">Compétences</h2>
                  <ul className="cv-list">
                    {skills.map((s, idx) => (
                      <li key={typeof s === 'string' ? `${s}-${idx}` : s.name || s.id} className="cv-list-item">
                        <span className="cv-dash">- </span>
                        <span className="cv-break">{typeof s === 'string' ? s : s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            <div className="cv-main">
              {educations.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Formation</h2>
                  {educations.map((e) => (
                    <article key={e.id} className="cv-entry">
                      <h3 className="cv-entry-title cv-break">{e.degree}</h3>
                      <div className="cv-entry-meta">
                        <span className="cv-entry-date cv-nowrap">{fmtDate(e.start_date)}{e.end_date ? ` - ${fmtDate(e.end_date)}` : ''}</span>
                        {e.school && <><span className="cv-sep">|</span><span className="cv-break">{e.school}</span></>}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {experiences.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Expérience</h2>
                  {experiences.map((e) => (
                    <article key={e.id} className="cv-entry">
                      <h3 className="cv-entry-title cv-break">{e.position || e.role}</h3>
                      <div className="cv-entry-meta">
                        <span className="cv-entry-date cv-nowrap">{fmtDate(e.start_date)}{e.end_date ? ` - ${fmtDate(e.end_date)}` : ''}</span>
                        {e.company && <><span className="cv-sep">|</span><span className="cv-break">{e.company}</span></>}
                      </div>
                      {e.description && <p className="cv-text cv-break">{e.description}</p>}
                    </article>
                  ))}
                </div>
              )}

              <div className="cv-grid-2col">
                {languages.length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-main-title">Langues</h2>
                    <ul className="cv-list">
                      {languages.map((l) => (
                        <li key={l.id || l.name} className="cv-list-item">
                          <span className="cv-dash">- </span>
                          <span className="cv-break">{l.name}{l.level ? ` (${l.level})` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {certifications.filter((c) => c.name).length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-main-title">Certifications</h2>
                    <div className="cv-list">
                      {certifications.filter((c) => c.name).map((c) => (
                        <div key={c.id} className="cv-list-item">
                          <span className="cv-dash">- </span>
                          <span className="cv-break"><span className="cv-cert-name">{c.name}</span>{c.year ? ` (${c.year})` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loisirs.length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-main-title">Loisirs</h2>
                    <ul className="cv-list">
                      {loisirs.map((l, idx) => (
                        <li key={`${l.label || l.url}-${idx}`} className="cv-list-item">
                          <span className="cv-dash">- </span>
                          <span className="cv-break">{l.label || l.url}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @page { size: A4; margin: 0; }

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
        }

        .cv-inner {
          display: flex;
          flex-direction: column;
          min-height: 297mm;
        }

        /* Header */
        .cv-header {
          border-bottom: 1px solid rgba(30,58,138,0.1);
          text-align: center;
          padding: 10mm 10mm 6mm;
        }
        .cv-name {
          font-size: 28px;
          font-weight: 600;
          line-height: 1.2;
          color: #1e3a8a;
          letter-spacing: -0.02em;
        }
        .cv-headline {
          margin-top: 2mm;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #1e3a8a;
        }

        /* Body layout */
        .cv-body {
          display: flex;
          flex: 1;
        }

        /* Sidebar */
        .cv-sidebar {
          width: 38%;
          border-right: 1px solid rgba(30,58,138,0.1);
          background: rgba(238,242,255,0.3);
          padding: 6mm 5mm;
          display: flex;
          flex-direction: column;
        }

        /* Photo */
        .cv-photo-wrap { text-align: center; margin-bottom: 5mm; }
        .cv-photo {
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          border: 2px solid #1e3a8a;
          object-fit: cover;
          object-position: top;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .cv-initials {
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          border: 2px solid #1e3a8a;
          background: #eff6ff;
          color: #1e3a8a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }

        /* Info */
        .cv-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3mm;
          font-size: 10px;
          font-weight: 500;
          color: #64748b;
        }
        .cv-info-item {}
        .cv-info-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 0.5mm;
        }
        .cv-info-value { color: #475569; }

        /* Sections */
        .cv-section { margin-top: 4mm; }
        .cv-side-title,
        .cv-main-title {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #1e3a8a;
          padding-bottom: 1mm;
          border-bottom: 1px solid rgba(30,58,138,0.15);
        }

        /* Lists with dash */
        .cv-list {
          margin-top: 2mm;
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1mm;
          font-size: 10px;
          color: #64748b;
        }
        .cv-list-item {
          display: flex;
          min-width: 0;
          gap: 1px;
        }
        .cv-dash {
          flex-shrink: 0;
          color: rgba(30,58,138,0.4);
        }
        .cv-cert-name {
          font-weight: 600;
          color: #1e293b;
        }

        /* Main content */
        .cv-main {
          flex: 1;
          min-width: 0;
          padding: 6mm 5mm;
          display: flex;
          flex-direction: column;
          gap: 4mm;
        }

        /* Entries */
        .cv-entry { margin-top: 2mm; }
        .cv-entry-title {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
        }
        .cv-entry-meta {
          margin-top: 0.5mm;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 1mm;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .cv-entry-date { color: #94a3b8; }
        .cv-sep { opacity: 0.3; }
        .cv-text {
          margin-top: 1mm;
          font-size: 10px;
          line-height: 1.5;
          color: #64748b;
          white-space: pre-line;
        }

        /* 2-col grid */
        .cv-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4mm 5mm;
        }

        /* Text overflow */
        .cv-break {
          overflow-wrap: anywhere;
          word-break: break-word;
          min-width: 0;
        }
        .cv-nowrap { white-space: nowrap; }

        @media print {
          body { margin: 0; padding: 0; }
          .cv-print-root { background: #fff; }
          .cv-page { margin: 0; box-shadow: none; }
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

function getAge(birthDate) {
  if (!birthDate) return null
  const d = new Date(birthDate)
  if (isNaN(d)) return null
  let age = new Date().getFullYear() - d.getFullYear()
  const m = new Date().getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age--
  return age >= 0 ? age : null
}
