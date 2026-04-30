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
  const certifications = cv.certifications || []
  const internships = cv.internships || []
  const loisirs = (profile.links || []).filter((l) => l?.label || l?.url)
  const theme = cv.theme || 'modern'

  if (theme === 'classic') {
    return (
      <div className="cv-print-root theme-classic">
        <div className="cv-page">
          <div className="p-12 flex flex-col h-full bg-white text-slate-800">
            <header className="border-b-4 border-slate-900 pb-8 text-center">
              <h1 className="font-serif text-5xl font-bold tracking-tight text-slate-900 uppercase">{stagiaire.full_name}</h1>
              <p className="mt-4 text-xl font-medium tracking-[0.2em] text-slate-600 uppercase">{cv.title || profile.filiere || '...'}</p>
              
              <div className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-semibold text-slate-500">
                {stagiaire.phone && <span>{stagiaire.phone}</span>}
                {stagiaire.email && <span>{stagiaire.email}</span>}
                {profile.city && <span>{profile.city}, Maroc</span>}
              </div>
            </header>

            <div className="mt-12 flex-1 space-y-12">
              {profile.bio && (
                <section>
                  <h2 className="border-b-2 border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">Profil</h2>
                  <p className="mt-6 text-[15px] leading-relaxed text-slate-600">{profile.bio}</p>
                </section>
              )}

              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-12">
                  {experiences.length > 0 && (
                    <section>
                      <h2 className="border-b-2 border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">Expérience</h2>
                      <div className="mt-8 space-y-8">
                        {experiences.map((e) => (
                          <article key={e.id}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-[17px] font-bold text-slate-900">{e.position}</h3>
                              <span className="text-xs font-bold text-slate-400">
                                {e.start_date ? fmtDate(e.start_date) : ''} — {e.end_date ? fmtDate(e.end_date) : 'Présent'}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase">{e.company}</p>
                            {e.description && <p className="mt-3 text-[14px] leading-relaxed text-slate-600 whitespace-pre-line">{e.description}</p>}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-12">
                  {educations.length > 0 && (
                    <section>
                      <h2 className="border-b-2 border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">Formation</h2>
                      <div className="mt-8 space-y-8">
                        {educations.map((e) => (
                          <article key={e.id}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-[17px] font-bold text-slate-900">{e.degree}</h3>
                              <span className="text-xs font-bold text-slate-400">
                                {e.start_date ? fmtDate(e.start_date) : ''} — {e.end_date ? fmtDate(e.end_date) : 'Présent'}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase">{e.school}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="space-y-10">
                    {skills.length > 0 && (
                      <div>
                        <h2 className="border-b-2 border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">Compétences</h2>
                        <p className="mt-6 text-[15px] leading-relaxed text-slate-600">
                          {skills.map(s => typeof s === 'string' ? s : s.name).join(' • ')}
                        </p>
                      </div>
                    )}

                    {languages.length > 0 && (
                      <div>
                        <h2 className="border-b-2 border-slate-200 pb-2 text-lg font-bold uppercase tracking-widest text-slate-900">Langues</h2>
                        <ul className="mt-6 space-y-3">
                          {languages.map((l) => (
                            <li key={l.id} className="text-[15px] text-slate-600">
                              <span className="font-bold text-slate-800">{l.name}</span>
                              {l.level && <span className="text-slate-400"> — {l.level}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @page { size: A4; margin: 0; }
          .cv-page { width: 210mm; min-height: 297mm; margin: 0 auto; }
          @media print { .cv-page { margin: 0; } }
          @media screen { .cv-page { margin: 20px auto; box-shadow: 0 0 20px rgba(0,0,0,0.1); } }
        `}</style>
      </div>
    )
  }

  // MODERN THEME
  return (
    <div className="cv-print-root">
      <div className="cv-page">
        <div className="cv-grid-wrap">
          <header className="cv-topbar">
            <h1 className="cv-name">{stagiaire.full_name}</h1>
            <p className="cv-headline">{cv.title || profile.filiere || ''}</p>
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

              {allExperiences.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-main-title">Expérience</h2>
                  {allExperiences.map((e) => (
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
