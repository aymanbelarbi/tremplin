import { useEffect, useState, useRef, forwardRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  GripVertical,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Save,
  Camera,
  Globe,
  Download,
  CalendarDays,
  Heart,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { getMyCv, updateMyCv, uploadCvPdf } from '@/api/cv'
import { getMyProfile } from '@/api/profile'
import SectionHeader from '@/components/ui/SectionHeader'
import GroupedSelect from '@/components/ui/GroupedSelect'
import { getJobTitlesForFiliere } from '@/lib/jobTitles'

const EMPTY_CV = {
  profile: { first_name: '', last_name: '', birth_date: '', headline: '', email: '', phone: '', address: '', summary: '' },
  experiences: [],
  educations: [],
  internships: [],
  skills: [],
  languages: [],
  certifications: [],
  links: [],
  theme: 'modern',
}

// Convert any date format (ISO timestamp, full date, etc.) to yyyy-MM for month inputs
function toMonth(v) {
  if (!v) return ''
  // Already in yyyy-MM format
  if (/^\d{4}-\d{2}$/.test(v)) return v
  // ISO timestamp or full date: extract yyyy-MM
  const d = new Date(v)
  if (isNaN(d)) return v
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function toUi({ cvData, profileData }) {
  const u = profileData?.user || {}
  const p = profileData?.profile || {}
  const rawTitle = cvData?.title || ''
  const normalizedTitle = rawTitle.startsWith('CV · ') ? '' : rawTitle

  const cvExperiences = (cvData?.experiences || []).map((e) => ({
    id: `exp${e.id}`,
    role: e.position,
    company: e.company,
    start: toMonth(e.start_date),
    end: e.end_date ? toMonth(e.end_date) : null,
    is_current: !!e.is_current,
    description: e.description || '',
  }))

  // Auto-fill experience from profile job data if employed and not already in CV
  if (p.employment_status === 'employed' && p.job_title && p.job_company) {
    const alreadyExists = cvExperiences.some(
      (e) => e.company === p.job_company && e.role === p.job_title
    )
    if (!alreadyExists) {
      cvExperiences.unshift({
        id: `exp_profile_${Date.now()}`,
        role: p.job_title,
        company: p.job_company,
        start: p.job_start_date ? p.job_start_date.slice(0, 7) : '',
        end: null,
        description: p.job_city ? `Basé à ${p.job_city}` : '',
      })
    }
  }

  // Merge profile languages (JSON array) with CV languages
  const profileLangs = (p.languages || []).map((l, i) => ({ id: `l_profile_${i}`, name: l.name || '', level: l.level || '' }))
  const cvLangs = (cvData?.languages || []).map((l, i) => ({ id: `l${i}`, name: l.name, level: l.level || '' }))
  const existingLangNames = new Set(cvLangs.map((l) => l.name.toLowerCase()))
  const mergedLangs = [
    ...cvLangs,
    ...profileLangs.filter((l) => l.name && !existingLangNames.has(l.name.toLowerCase())),
  ]

  // Merge profile skills (hard_skills + soft_skills) with CV skills
  const profileSkills = [...(p.hard_skills || []), ...(p.soft_skills || [])]
  const cvSkills = (cvData?.skills || []).map((s) => s.name)
  const existingSkillNames = new Set(cvSkills.map((s) => s.toLowerCase()))
  const mergedSkills = [...cvSkills, ...profileSkills.filter((s) => s && !existingSkillNames.has(s.toLowerCase()))]

  // Merge certifications
  const profileCerts = (p.certifications || []).map((c, i) => ({ id: `cert_profile_${i}`, name: c.name || '', year: c.year || '' }))
  const cvCerts = (cvData?.certifications || []).map((c, i) => ({ id: `cert${i}`, name: c.name, year: c.year || '' }))
  const existingCertNames = new Set(cvCerts.map((c) => c.name.toLowerCase()))
  const mergedCerts = [...cvCerts, ...profileCerts.filter((c) => c.name && !existingCertNames.has(c.name.toLowerCase()))]

  return {
    title: cvData?.title || 'Mon CV',
    theme: cvData?.theme || 'modern',
    photoUrl: p.photo_path || null,
    profile: {
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      birth_date: p.birth_date || '',
      headline: normalizedTitle,
      email: u.email || '',
      phone: u.phone || '',
      address: p.address || p.city || '',
      summary: cvData?.summary || p.bio || '',
    },
    experiences: cvExperiences,
    educations: (cvData?.educations || []).map((e) => ({
      id: `ed${e.id}`,
      title: e.degree,
      school: e.school,
      start: toMonth(e.start_date),
      end: e.end_date ? toMonth(e.end_date) : null,
      is_current: !e.end_date,
    })),
    skills: mergedSkills,
    languages: mergedLangs,
    certifications: mergedCerts,
    internships: (cvData?.internships || []).map((i) => ({
      id: `int${i.id}`,
      position: i.position,
      company: i.company,
      start: toMonth(i.start_date),
      end: i.end_date ? toMonth(i.end_date) : null,
      description: i.description || '',
    })),
    links: (cvData?.links || p.links || []).map((l, idx) => ({ id: `link_${idx}`, label: l.label || '', url: l.url || '' })),
  }
}

function toApi(cv) {
  const normDate = (v) => {
    if (!v) return null
    // Already yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    // yyyy-MM → append -01
    if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01`
    // ISO timestamp → extract yyyy-MM-dd
    const d = new Date(v)
    if (!isNaN(d)) return d.toISOString().split('T')[0]
    return v
  }
  return {
    title: cv.profile.headline || null,
    summary: cv.profile.summary || null,
    theme: cv.theme || 'modern',
    first_name: cv.profile.first_name || null,
    last_name: cv.profile.last_name || null,
    address: cv.profile.address || null,
    birth_date: cv.profile.birth_date || null,
    phone: cv.profile.phone || null,
    experiences: cv.experiences
      .filter((e) => e.role && e.company && e.start)
      .map((e) => ({
        position: e.role,
        company: e.company,
        start_date: normDate(e.start),
        end_date: e.is_current ? null : normDate(e.end),
        is_current: !!e.is_current,
        description: e.description || null,
      })),
    educations: cv.educations
      .filter((e) => e.title && e.school)
      .map((e) => ({
        degree: e.title,
        school: e.school,
        start_date: normDate(e.start),
        end_date: e.is_current ? null : normDate(e.end),
        is_current: !!e.is_current,
      })),
    skills: cv.skills.filter(Boolean).map((name) => ({ name })),
    languages: cv.languages
      .filter((l) => l.name)
      .map((l) => {
        const level = ['Débutant', 'Moyen', 'Bien', 'Excellent', 'Maternel'].includes(l.level) ? l.level : null
        return level ? { name: l.name, level } : { name: l.name }
      }),
    certifications: (cv.certifications || [])
      .filter((c) => c.name)
      .map((c) => ({ name: c.name, year: c.year || null })),
    links: (cv.links || [])
      .filter((l) => l.label || l.url)
      .map((l) => ({ label: l.label || null, url: l.url || null })),
    internships: cv.internships
      .filter((i) => i.position && i.company && i.start)
      .map((i) => ({
        position: i.position,
        company: i.company,
        start_date: normDate(i.start),
        end_date: i.is_current ? null : normDate(i.end),
        is_current: !!i.is_current,
        description: i.description || null,
      })),
  }
}

export default function CvBuilderPage() {
  const queryClient = useQueryClient()
  const cvQuery = useQuery({ queryKey: ['me', 'cv'], queryFn: getMyCv })
  const profileQuery = useQuery({ queryKey: ['me', 'profile'], queryFn: getMyProfile })

  const [cv, setCv] = useState(EMPTY_CV)
  const [section, setSection] = useState('profile')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [dragState, setDragState] = useState({ section: null, startIndex: null, overIndex: null })
  const cvRef = useRef(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  function handleDragStart(sec, index) {
    setDragState({ section: sec, startIndex: index, overIndex: index })
  }
  function handleDragEnter(sec, index) {
    if (dragState.section === sec) {
      setDragState(prev => ({ ...prev, overIndex: index }))
    }
  }
  function handleDragEnd() {
    const { section: sec, startIndex, overIndex } = dragState
    if (sec && startIndex !== null && overIndex !== null && startIndex !== overIndex) {
      const arr = [...cv[sec]]
      const item = arr[startIndex]
      arr.splice(startIndex, 1)
      arr.splice(overIndex, 0, item)
      setCv(prev => ({ ...prev, [sec]: arr }))
    }
    setDragState({ section: null, startIndex: null, overIndex: null })
  }

  const [lastSavedCv, setLastSavedCv] = useState(null)

  useEffect(() => {
    if (cvQuery.data || profileQuery.data) {
      const ui = toUi({ cvData: cvQuery.data, profileData: profileQuery.data })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCv(ui)
      setLastSavedCv(ui)
      setHasPhoto(Boolean(ui.photoUrl))
    }
  }, [cvQuery.data, profileQuery.data])

  const isDirty = lastSavedCv && JSON.stringify(cv) !== JSON.stringify(lastSavedCv)

  const mutation = useMutation({
    mutationFn: async (apiData) => {
      await updateMyCv(apiData)
      
      const el = cvRef.current
      if (el && hasPhoto) {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pageW = 210
        const pageH = 297
        const imgW = canvas.width
        const imgH = canvas.height
        const ratio = Math.min(pageW / imgW, pageH / imgH)
        const w = imgW * ratio
        const h = imgH * ratio
        const x = (pageW - w) / 2
        const y = (pageH - h) / 2
        pdf.addImage(imgData, 'JPEG', x, y, w, h, undefined, 'FAST')
        
        const blob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' })
        const formData = new FormData()
        formData.append('pdf', blob, 'cv.pdf')
        await uploadCvPdf(formData)
      }
    },
    onSuccess: () => {
      toast.success('CV et PDF enregistrés avec succès.')
      setLastSavedCv(cv)
      queryClient.invalidateQueries({ queryKey: ['me', 'cv'] })
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
    },
    onError: () => toast.error('Enregistrement impossible.'),
  })

  function addExperience() {
    setCv({
      ...cv,
      experiences: [
        ...cv.experiences,
        { id: `exp${Date.now()}`, role: '', company: '', start: '', end: null, is_current: false, description: '' },
      ],
    })
  }
  function addEducation() {
    setCv({
      ...cv,
      educations: [
        ...cv.educations,
        { id: `ed${Date.now()}`, title: '', school: '', start: '', end: null, is_current: false },
      ],
    })
  }

  function handleSave() {
    mutation.mutate(toApi(cv))
  }

  async function handleDownloadPdf() {
    const el = cvRef.current
    if (!el) return
    setPdfLoading(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.9)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const pageH = 297
      const imgW = canvas.width
      const imgH = canvas.height
      const ratio = Math.min(pageW / imgW, pageH / imgH)
      const w = imgW * ratio
      const h = imgH * ratio
      const x = (pageW - w) / 2
      const y = (pageH - h) / 2
      pdf.addImage(imgData, 'JPEG', x, y, w, h, undefined, 'FAST')
      const fullName = [cv.profile.first_name, cv.profile.last_name].filter(Boolean).join('_') || 'cv'
      pdf.save(`CV_${fullName}.pdf`)
      toast.success('PDF téléchargé !')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la génération du PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  const isLoading = cvQuery.isLoading || profileQuery.isLoading

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Espace stagiaire"
        title={<>Mon <span className="display-italic text-brand-600">CV</span></>}
        description="Éditez votre CV à gauche, visualisez l'aperçu en direct à droite. Exportez-le ensuite au format PDF."
        actions={
          <>
            <button onClick={handleDownloadPdf} className="btn-ghost" title="Télécharger PDF" disabled={pdfLoading}>
              {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={mutation.isPending || !hasPhoto || !isDirty}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </button>
          </>
        }
      />

      {isLoading && (
        <div className="card flex items-center justify-center gap-2 p-6 text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement du CV…
        </div>
      )}

      <nav className="card overflow-x-auto p-2">
        <div className="flex justify-center gap-1 min-w-max">
          {[
            { id: 'profile', label: 'Informations personnelles' },
            { id: 'educations', label: 'Formation' },
            { id: 'experiences', label: 'Expérience' },
            { id: 'skills', label: 'Compétences' },
            { id: 'certifications', label: 'Certifications' },
            { id: 'languages', label: 'Langues' },
            { id: 'loisirs', label: 'Loisirs' },
            { id: 'design', label: 'Design' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                section === t.id
                  ? 'bg-ink text-paper'
                  : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">

          {section === 'design' && (
            <EditorCard title="Thème du CV">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'modern', label: 'Moderne', desc: 'Design épuré avec barre latérale.' },
                  { id: 'classic', label: 'Classique', desc: 'Mise en page traditionnelle centrée.' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCv({ ...cv, theme: t.id })}
                    className={`flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                      cv.theme === t.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-ink/5 bg-paper-tint hover:border-ink/10'
                    }`}
                  >
                    <span className={`text-sm font-bold ${cv.theme === t.id ? 'text-brand-700' : 'text-ink'}`}>
                      {t.label}
                    </span>
                    <span className="text-[11px] leading-relaxed text-ink-muted">{t.desc}</span>
                  </button>
                ))}
              </div>
            </EditorCard>
          )}

          {section === 'profile' && (
            <EditorCard title="Informations personnelles">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Prénom">
                  <input className="input w-full" placeholder="Yassine" value={cv.profile.first_name} onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, first_name: e.target.value } })} />
                </Field>
                <Field label="Nom">
                  <input className="input w-full" placeholder="El Mansouri" value={cv.profile.last_name} onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, last_name: e.target.value } })} />
                </Field>
                <Field label="Email">
                  <input type="email" className="input w-full" placeholder="yassine@example.com" value={cv.profile.email} onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, email: e.target.value } })} />
                </Field>
                <Field label="Téléphone">
                  <input className="input w-full" placeholder="06 12 34 56 78" value={cv.profile.phone} onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, phone: e.target.value } })} />
                </Field>
                <Field label="Date de naissance">
                  <input type="date" className="input w-full" value={cv.profile.birth_date || ''} max={getMaxBirthDate()} onChange={(e) => {
                    const val = e.target.value
                    if (val) {
                      const age = getAge(val)
                      if (age !== null && age < 18) {
                        toast.error('Vous devez avoir au moins 18 ans.')
                        return
                      }
                    }
                    setCv({ ...cv, profile: { ...cv.profile, birth_date: val } })
                  }} />
                </Field>
                <Field label="Adresse">
                  <input className="input w-full" placeholder="Khémisset" value={cv.profile.address} onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, address: e.target.value } })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Titre">
                    <input
                      className="input w-full"
                      value={cv.profile.headline}
                      placeholder="Technicien Spécialisé en Développement Digital, option Web Full Stack"
                      onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, headline: e.target.value } })}
                    />
                    {getJobTitlesForFiliere(profileQuery.data?.profile?.filiere).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {getJobTitlesForFiliere(profileQuery.data.profile.filiere).map((t) => (
                          <button key={t} type="button" onClick={() => setCv({ ...cv, profile: { ...cv.profile, headline: t } })} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 hover:bg-brand-100">
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </Field>
                </div>
              </div>
              <Field label="Profil">
                <textarea rows={4} className="input w-full resize-none" placeholder="Stagiaire motivé, sérieux et passionné par le développement web..." value={cv.profile.summary} onChange={(e) => setCv({ ...cv, profile: { ...cv.profile, summary: e.target.value } })} />
              </Field>
            </EditorCard>
          )}

          {section === 'experiences' && (
            <EditorCard
              title="Expériences"
              action={
                <button onClick={addExperience} className="btn-ghost text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              }
            >
              {cv.experiences.map((e, i) => (
                <ListRow
                  key={e.id}
                  onRemove={() => setCv({ ...cv, experiences: cv.experiences.filter((_, x) => x !== i) })}
                  onDragStart={() => handleDragStart('experiences', i)}
                  onDragEnter={() => handleDragEnter('experiences', i)}
                  onDragEnd={handleDragEnd}
                  isDragged={dragState.section === 'experiences' && dragState.startIndex === i}
                  isDragOver={dragState.section === 'experiences' && dragState.overIndex === i && dragState.startIndex !== i}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Poste">
                      <input className="input w-full" placeholder="Développeur web" value={e.role} onChange={(ev) => {
                        const arr = [...cv.experiences]
                        arr[i] = { ...e, role: ev.target.value }
                        setCv({ ...cv, experiences: arr })
                      }} />
                    </Field>
                    <Field label="Entreprise">
                      <input className="input w-full" placeholder="Nom de l'entreprise" value={e.company} onChange={(ev) => {
                        const arr = [...cv.experiences]
                        arr[i] = { ...e, company: ev.target.value }
                        setCv({ ...cv, experiences: arr })
                      }} />
                    </Field>
                    <Field label="Début">
                      <input type="month" className="input w-full" value={e.start} onChange={(ev) => {
                        const arr = [...cv.experiences]
                        arr[i] = { ...e, start: ev.target.value }
                        setCv({ ...cv, experiences: arr })
                      }} />
                    </Field>
                    <Field label="Fin">
                      <div className="flex flex-col gap-2">
                        <input type="month" className="input w-full" disabled={e.is_current} value={e.end || ''} onChange={(ev) => {
                          const arr = [...cv.experiences]
                          arr[i] = { ...e, end: ev.target.value || null }
                          setCv({ ...cv, experiences: arr })
                        }} />
                        <label className="flex w-max cursor-pointer items-center gap-2 text-xs font-medium text-ink-soft transition-colors hover:text-ink">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={!!e.is_current}
                              onChange={(ev) => {
                                const arr = [...cv.experiences]
                                arr[i] = { ...e, is_current: ev.target.checked, end: ev.target.checked ? null : e.end }
                                setCv({ ...cv, experiences: arr })
                              }}
                              className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-ink/20 bg-paper transition-all checked:border-brand-500 checked:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-1"
                            />
                            <svg
                              className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          Toujours en poste
                        </label>
                      </div>
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea rows={3} className="input w-full resize-none" placeholder="Missions, réalisations, technologies utilisées..." value={e.description} onChange={(ev) => {
                      const arr = [...cv.experiences]
                      arr[i] = { ...e, description: ev.target.value }
                      setCv({ ...cv, experiences: arr })
                    }} />
                  </Field>
                </ListRow>
              ))}
            </EditorCard>
          )}



          {section === 'educations' && (
            <EditorCard
              title="Formation"
              action={
                <button onClick={addEducation} className="btn-ghost text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              }
            >
              {cv.educations.map((e, i) => (
                <ListRow
                  key={e.id}
                  onRemove={() => setCv({ ...cv, educations: cv.educations.filter((_, x) => x !== i) })}
                  onDragStart={() => handleDragStart('educations', i)}
                  onDragEnter={() => handleDragEnter('educations', i)}
                  onDragEnd={handleDragEnd}
                  isDragged={dragState.section === 'educations' && dragState.startIndex === i}
                  isDragOver={dragState.section === 'educations' && dragState.overIndex === i && dragState.startIndex !== i}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Intitulé">
                      <input className="input w-full" placeholder="Technicien Spécialisé en Développement Digital" value={e.title} onChange={(ev) => {
                        const arr = [...cv.educations]
                        arr[i] = { ...e, title: ev.target.value }
                        setCv({ ...cv, educations: arr })
                      }} />
                    </Field>
                    <Field label="Établissement">
                      <input className="input w-full" placeholder="ISTA Khémisset" value={e.school} onChange={(ev) => {
                        const arr = [...cv.educations]
                        arr[i] = { ...e, school: ev.target.value }
                        setCv({ ...cv, educations: arr })
                      }} />
                    </Field>
                    <Field label="Début">
                      <input type="month" className="input w-full" value={e.start} onChange={(ev) => {
                        const arr = [...cv.educations]
                        arr[i] = { ...e, start: ev.target.value }
                        setCv({ ...cv, educations: arr })
                      }} />
                    </Field>
                    <Field label="Fin">
                      <div className="flex flex-col gap-2">
                        <input type="month" className="input w-full" disabled={e.is_current} value={e.end || ''} onChange={(ev) => {
                          const arr = [...cv.educations]
                          arr[i] = { ...e, end: ev.target.value || null }
                          setCv({ ...cv, educations: arr })
                        }} />
                        <label className="flex w-max cursor-pointer items-center gap-2 text-xs font-medium text-ink-soft transition-colors hover:text-ink">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={!!e.is_current}
                              onChange={(ev) => {
                                const arr = [...cv.educations]
                                arr[i] = { ...e, is_current: ev.target.checked, end: ev.target.checked ? null : e.end }
                                setCv({ ...cv, educations: arr })
                              }}
                              className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-ink/20 bg-paper transition-all checked:border-brand-500 checked:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-1"
                            />
                            <svg
                              className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          Jusqu'à présent
                        </label>
                      </div>
                    </Field>
                  </div>
                </ListRow>
              ))}
            </EditorCard>
          )}

          {section === 'skills' && (
            <EditorCard
              title="Compétences"
              action={
                <button onClick={() => setCv({ ...cv, skills: [...cv.skills, ''] })} className="btn-ghost text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              }
            >
              {cv.skills.map((s, i) => (
                <ListRow
                  key={i}
                  onRemove={() => setCv({ ...cv, skills: cv.skills.filter((_, x) => x !== i) })}
                  onDragStart={() => handleDragStart('skills', i)}
                  onDragEnter={() => handleDragEnter('skills', i)}
                  onDragEnd={handleDragEnd}
                  isDragged={dragState.section === 'skills' && dragState.startIndex === i}
                  isDragOver={dragState.section === 'skills' && dragState.overIndex === i && dragState.startIndex !== i}
                >
                  <Field label={`Compétence ${i + 1}`}>
                    <input className="input w-full" value={s} onChange={(ev) => {
                      const arr = [...cv.skills]
                      arr[i] = ev.target.value
                      setCv({ ...cv, skills: arr })
                    }} placeholder="Ex : JavaScript, Gestion de projet…" />
                  </Field>
                </ListRow>
              ))}
            </EditorCard>
          )}

          {section === 'languages' && (
            <EditorCard
              title="Langues"
              action={
                <button onClick={() => setCv({ ...cv, languages: [...cv.languages, { id: `l${Date.now()}`, name: '', level: '' }] })} className="btn-ghost text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              }
            >
              {cv.languages.map((l, i) => (
                <ListRow
                  key={l.id}
                  onRemove={() => setCv({ ...cv, languages: cv.languages.filter((_, x) => x !== i) })}
                  onDragStart={() => handleDragStart('languages', i)}
                  onDragEnter={() => handleDragEnter('languages', i)}
                  onDragEnd={handleDragEnd}
                  isDragged={dragState.section === 'languages' && dragState.startIndex === i}
                  isDragOver={dragState.section === 'languages' && dragState.overIndex === i && dragState.startIndex !== i}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Langue">
                      <input className="input w-full" value={l.name} onChange={(ev) => {
                        const arr = [...cv.languages]
                        arr[i] = { ...l, name: ev.target.value }
                        setCv({ ...cv, languages: arr })
                      }} placeholder="Français, Arabe…" />
                    </Field>
                    <Field label="Niveau">
                      <GroupedSelect
                        id={`lang-level-${i}`}
                        label=""
                        placeholder="Choisir"
                        groups={[
                          {
                            parent: 'Niveaux',
                            options: [
                              { label: 'Débutant', value: 'Débutant' },
                              { label: 'Moyen', value: 'Moyen' },
                              { label: 'Bien', value: 'Bien' },
                              { label: 'Excellent', value: 'Excellent' },
                              { label: 'Maternel', value: 'Maternel' },
                            ],
                          },
                        ]}
                        value={l.level}
                        onChange={(v) => {
                          const arr = [...cv.languages]
                          arr[i] = { ...l, level: v }
                          setCv({ ...cv, languages: arr })
                        }}
                      />
                    </Field>
                  </div>
                </ListRow>
              ))}
            </EditorCard>
          )}

          {section === 'certifications' && (
            <EditorCard
              title="Certifications"
              action={
                <button onClick={() => setCv({ ...cv, certifications: [...(cv.certifications || []), { id: `cert${Date.now()}`, name: '', year: '' }] })} className="btn-ghost text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              }
            >
              {cv.certifications?.map((c, i) => (
                <ListRow
                  key={c.id}
                  onRemove={() => {
                    const arr = cv.certifications.filter((_, x) => x !== i)
                    setCv({ ...cv, certifications: arr })
                  }}
                  onDragStart={() => handleDragStart('certifications', i)}
                  onDragEnter={() => handleDragEnter('certifications', i)}
                  onDragEnd={handleDragEnd}
                  isDragged={dragState.section === 'certifications' && dragState.startIndex === i}
                  isDragOver={dragState.section === 'certifications' && dragState.overIndex === i && dragState.startIndex !== i}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Certification">
                      <input className="input w-full" placeholder="JavaScript Essentials" value={c.name} onChange={(ev) => {
                        const arr = [...cv.certifications]
                        arr[i] = { ...c, name: ev.target.value }
                        setCv({ ...cv, certifications: arr })
                      }} />
                    </Field>
                    <Field label="Année">
                      <input type="number" className="input w-full" value={c.year || ''} onChange={(ev) => {
                        const arr = [...cv.certifications]
                        arr[i] = { ...c, year: ev.target.value ? parseInt(ev.target.value) : '' }
                        setCv({ ...cv, certifications: arr })
                      }} placeholder="2025" min={2000} />
                    </Field>
                  </div>
                </ListRow>
              ))}
            </EditorCard>
          )}

          {section === 'loisirs' && (
            <EditorCard
              title="Loisirs"
              action={
                <button onClick={() => setCv({ ...cv, links: [...(cv.links || []), { id: `link_${Date.now()}`, label: '', url: '' }] })} className="btn-ghost text-xs">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              }
            >
              {(cv.links || []).map((l, i) => (
                <ListRow
                  key={l.id}
                  onRemove={() => setCv({ ...cv, links: cv.links.filter((_, x) => x !== i) })}
                  onDragStart={() => handleDragStart('links', i)}
                  onDragEnter={() => handleDragEnter('links', i)}
                  onDragEnd={handleDragEnd}
                  isDragged={dragState.section === 'links' && dragState.startIndex === i}
                  isDragOver={dragState.section === 'links' && dragState.overIndex === i && dragState.startIndex !== i}
                >
                  <Field label={`Loisir ${i + 1}`}>
                    <input className="input w-full" value={l.label} onChange={(ev) => {
                      const arr = [...cv.links]
                      arr[i] = { ...l, label: ev.target.value }
                      setCv({ ...cv, links: arr })
                    }} placeholder="Ex : Lecture, Football, Voyage…" />
                  </Field>
                </ListRow>
              ))}
            </EditorCard>
          )}

        </div>

        {hasPhoto ? (
          <CvPreview cv={cv} ref={cvRef} />
        ) : (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-raised aspect-[1/1.414] flex flex-col items-center justify-center gap-4 bg-paper-card p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink/5 text-ink-subtle">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-lg font-medium text-ink">Photo requise</p>
                <p className="mt-1 text-sm text-ink-muted">Ajoutez une photo de profil pour activer l'aperçu du CV.</p>
              </div>
              <Link to="/espace/profil" className="btn-primary mt-2 text-sm">Aller au profil</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditorCard({ title, action, children }) {
  return (
    <section className="card-raised p-5">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="display text-lg text-ink">{title}</h2>
        {action}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-ink-subtle">{hint}</span>}
    </label>
  )
}

function ListRow({ onRemove, onDragStart, onDragEnter, onDragEnd, isDragged, isDragOver, children }) {
  const [draggable, setDraggable] = useState(false)

  return (
    <div 
      className={`rounded-2xl border p-4 transition-all ${isDragged ? 'opacity-50 border-brand-500 border-dashed' : isDragOver ? 'border-brand-500 bg-brand-50' : 'border-ink/10 bg-paper-tint'}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={(e) => {
        setDraggable(false)
        if (onDragEnd) onDragEnd(e)
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="mb-3 flex items-center justify-between text-ink-subtle">
        <div 
          className="cursor-grab active:cursor-grabbing hover:text-ink p-1 -ml-1"
          onMouseEnter={() => setDraggable(true)}
          onMouseLeave={() => setDraggable(false)}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <button type="button" onClick={onRemove} className="rounded-full p-1 text-ink-subtle hover:bg-ink/5 hover:text-ink" aria-label="Retirer">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function fmtDate(v) {
  if (!v) return ''
  const d = new Date(v)
  if (isNaN(d)) return v
  return d.toLocaleDateString('fr-FR', { year: 'numeric' })
}

function getMaxBirthDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
}

function getAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth)) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

export const CvPreview = forwardRef(function CvPreview({ cv }, ref) {
  const experiences = cv.experiences || []
  const loisirs = (cv.links || []).filter((l) => l.label || l.url)
  const fullName = [cv.profile.first_name, cv.profile.last_name].filter(Boolean).join(' ').trim()
  const age = getAge(cv.profile.birth_date)
  const theme = cv.theme || 'modern'

  if (theme === 'classic') {
    return (
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div ref={ref} className="card-raised aspect-[1/1.414] overflow-hidden bg-white p-10 text-slate-800 shadow-xl">
          <div className="flex flex-col h-full">
            <header className="border-b-2 border-slate-900 pb-6 text-center">
              <h3 className="font-serif text-3xl font-bold tracking-tight text-slate-900 uppercase">{fullName}</h3>
              <p className="mt-2 text-sm font-medium tracking-widest text-slate-600 uppercase">{cv.profile.headline || '...'}</p>
              
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[10px] font-medium text-slate-500">
                {cv.profile.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {cv.profile.phone}</span>}
                {cv.profile.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {cv.profile.email}</span>}
                {cv.profile.address && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {cv.profile.address}</span>}
              </div>
            </header>

            <div className="mt-8 flex-1 space-y-8 overflow-hidden">
              {cv.profile.summary && (
                <section>
                  <h4 className="border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">Profil</h4>
                  <p className="mt-3 text-[10px] leading-relaxed text-slate-600">{cv.profile.summary}</p>
                </section>
              )}

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-8">
                  {experiences.length > 0 && (
                    <section>
                      <h4 className="border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">Expérience</h4>
                      <div className="mt-4 space-y-5">
                        {experiences.map((e) => (
                          <article key={e.id}>
                            <div className="flex justify-between items-baseline">
                              <h5 className="text-[11px] font-bold text-slate-900">{e.role || e.position}</h5>
                              <span className="text-[9px] font-bold text-slate-400">
                                {e.start ? fmtDate(e.start) : ''}{e.is_current ? ' - Présent' : e.end ? ` - ${fmtDate(e.end)}` : ''}
                              </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">{e.company}</p>
                            {e.description && <p className="mt-1.5 text-[9px] leading-relaxed text-slate-600 whitespace-pre-line line-clamp-4">{e.description}</p>}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-8">
                  {cv.educations.length > 0 && (
                    <section>
                      <h4 className="border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">Formation</h4>
                      <div className="mt-4 space-y-5">
                        {cv.educations.map((e) => (
                          <article key={e.id}>
                            <div className="flex justify-between items-baseline">
                              <h5 className="text-[11px] font-bold text-slate-900">{e.title}</h5>
                              <span className="text-[9px] font-bold text-slate-400">
                                {e.start ? fmtDate(e.start) : ''}{e.is_current ? ' - Présent' : e.end ? ` - ${fmtDate(e.end)}` : ''}
                              </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">{e.school}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="space-y-6">
                    {cv.skills.filter(Boolean).length > 0 && (
                      <div>
                        <h4 className="border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">Compétences</h4>
                        <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
                          {cv.skills.filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    )}

                    {cv.languages.length > 0 && (
                      <div>
                        <h4 className="border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">Langues</h4>
                        <ul className="mt-3 space-y-1">
                          {cv.languages.map((l) => (
                            <li key={l.id} className="text-[10px] text-slate-600">
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
      </div>
    )
  }

  // MODERN THEME (Default)
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div ref={ref} className="card-raised aspect-[1/1.414] overflow-hidden bg-paper-card">
        <div className="grid h-full grid-rows-[auto_1fr]">
          <header className="border-b border-ink/10 px-6 pt-5 pb-6 text-center">
            <h3 className="display text-[18px] leading-none tracking-tight text-ink">{fullName}</h3>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-brand-700">{cv.profile.headline || '...'}</p>
          </header>

          <div className="flex h-full">
          <aside className="relative flex flex-col border-r border-ink/10 bg-paper-tint/30 p-4 text-ink min-w-[35%] max-w-[45%] shrink-0 overflow-hidden">
            <div className="flex flex-col items-center">
              {cv.photoUrl ? (
                <img src={cv.photoUrl} alt="Photo" className="mb-5 h-20 w-20 rounded-full border-2 border-brand-700 object-cover shadow-sm" />
              ) : (
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-50 text-2xl font-bold text-brand-800 shadow-sm">
                  {[cv.profile.first_name, cv.profile.last_name].filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-2 text-[9px] font-medium text-ink-soft">
              {age !== null && (
                <p className="flex items-baseline">
                  <span className="w-8 shrink-0 text-[8px] font-bold uppercase tracking-wider text-ink-subtle">Age</span>
                  <span>{age} ans</span>
                </p>
              )}
              {cv.profile.address && (
                <p className="flex items-baseline">
                  <span className="w-8 shrink-0 text-[8px] font-bold uppercase tracking-wider text-ink-subtle">Loc</span>
                  <span className="min-w-0 break-words">{cv.profile.address}, Maroc</span>
                </p>
              )}
              {cv.profile.phone && (
                <p className="flex items-baseline">
                  <span className="w-8 shrink-0 text-[8px] font-bold uppercase tracking-wider text-ink-subtle">Num</span>
                  <span className="min-w-0 break-words">{cv.profile.phone}</span>
                </p>
              )}
              {cv.profile.email && (
                <p className="flex items-baseline">
                  <span className="w-8 shrink-0 text-[8px] font-bold uppercase tracking-wider text-ink-subtle">Mail</span>
                  <span className="min-w-0 break-all">{cv.profile.email}</span>
                </p>
              )}
            </div>

            {cv.profile.summary && (
              <div className="mt-6 border-t border-ink/5 pt-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Profil</p>
                <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">{cv.profile.summary}</p>
              </div>
            )}
          </aside>

          <div className="flex-1 min-w-0 flex flex-col gap-5 p-5 text-ink">
            {cv.educations.length > 0 && (
              <section>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Formation</p>
                <div className="mt-3 space-y-3">
                  {cv.educations.map((e) => (
                    <article key={e.id}>
                      <h4 className="text-[10px] font-bold text-ink">{e.title}</h4>
                      <p className="mt-0.5 text-[8px] font-semibold tracking-wider text-ink-subtle uppercase">
                        {e.start ? fmtDate(e.start) : ''}
                        {e.is_current ? ' - Présent' : e.end ? ` - ${fmtDate(e.end)}` : ''}
                        <span className="mx-1 opacity-30">|</span>
                        {e.school}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {experiences.length > 0 && (
              <section>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Expérience</p>
                <div className="mt-3 space-y-3">
                  {experiences.map((e) => (
                    <article key={e.id}>
                      <h4 className="text-[10px] font-bold text-ink">{e.role || e.position}</h4>
                      <p className="mt-0.5 text-[8px] font-semibold tracking-wider text-ink-subtle uppercase">
                        {e.start ? fmtDate(e.start) : ''}
                        {e.is_current ? ' - Présent' : e.end ? ` - ${fmtDate(e.end)}` : ''}
                        <span className="mx-1 opacity-30">|</span>
                        {e.company}
                      </p>
                      {e.description && <p className="mt-1 text-[9px] leading-relaxed text-ink-soft whitespace-pre-line">{e.description}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {cv.skills.filter(Boolean).length > 0 && (
                <section>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Compétences</p>
                  <ul className="mt-2.5 space-y-1 text-[9px] text-ink-soft">
                    {cv.skills.filter(Boolean).map((s) => <li key={s} className="flex items-center gap-2"><span className="shrink-0 text-brand-700/50">-</span>{s}</li>)}
                  </ul>
                </section>
              )}

              {cv.languages.length > 0 && (
                <section>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Langues</p>
                  <ul className="mt-2.5 space-y-1 text-[9px] text-ink-soft">
                    {cv.languages.map((l) => (
                      <li key={l.id} className="flex items-center gap-1">
                        <span className="shrink-0 text-brand-700/50">-</span>
                        <span>{l.name}</span>
                        {l.level && <span className="text-[8px] text-ink-subtle">({l.level})</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {cv.certifications?.filter((c) => c.name).length > 0 && (
                <section>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Certifications</p>
                  <div className="mt-2.5 space-y-1">
                    {cv.certifications.filter((c) => c.name).map((c) => (
                      <article key={c.id} className="text-[9px] text-ink-soft flex items-baseline gap-1">
                        <span className="shrink-0 text-brand-700/50">-</span>
                        <span className="font-medium text-ink">{c.name}</span>
                        {c.year && <span className="text-[8px] text-ink-subtle">({c.year})</span>}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {loisirs.length > 0 && (
                <section>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-700">Loisirs</p>
                  <ul className="mt-2.5 space-y-1 text-[9px] text-ink-soft">
                    {loisirs.map((l) => (
                      <li key={l.id} className="flex items-center gap-2"><span className="shrink-0 text-brand-700/50">-</span>{l.label || l.url}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
})
