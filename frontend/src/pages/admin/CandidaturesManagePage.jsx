import { useMemo, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Eye,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { AnimatePresence, motion } from 'framer-motion'
import { listAdminApplications } from '@/api/applications'
import { getStagiaire } from '@/api/admin'
import { normalizeAdminApplication, normalizeStagiaire } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import IconBtn from '@/components/ui/IconBtn'
import GroupedSelect from '@/components/ui/GroupedSelect'
import { useFilieres } from '@/hooks/useFilieres'
import Badge from '@/components/ui/Badge'
import { CvPreview, toUi } from '@/pages/stagiaire/CvBuilderPage'
import { EMPLOYMENT_LABELS } from '@/mocks/data'

export default function CandidaturesManagePage() {
  const [query, setQuery] = useState('')
  const [filiereFilter, setFiliereFilter] = useState('')
  const [viewCvId, setViewCvId] = useState(null)

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: () => listAdminApplications(),
  })
  const rows = useMemo(() => raw.map(normalizeAdminApplication), [raw])

  const { filiereGroups, isLoading: loadingFilieres } = useFilieres()

  const list = useMemo(() => {
    return rows.filter((r) => {
      if (filiereFilter && r.filiere !== filiereFilter) return false
      if (query) {
        const q = query.toLowerCase()
        if (!(r.stagiaire || '').toLowerCase().includes(q) && !(r.offer || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [rows, query, filiereFilter])

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Administration"
        title={<>Gestion des <span className="display-italic text-brand-600">candidatures</span></>}
        description="Parcourez les candidatures reçues et statuez directement depuis le tableau."
      />

      <div className="card-raised p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par stagiaire, offre…"
              className="input w-full pl-11"
            />
          </label>
          <div className="w-64">
            <GroupedSelect
              id="filter-filiere"
              placeholder={loadingFilieres ? 'Chargement...' : 'Toutes filières'}
              groups={[
                { parent: 'Toutes', options: [{ label: 'Toutes filières', value: '' }] },
                ...filiereGroups.map((g) => ({
                  parent: g.parent,
                  options: g.options.map((o) => ({ label: o, value: o })),
                })),
              ]}
              value={filiereFilter}
              onChange={(v) => setFiliereFilter(v)}
            />
          </div>
        </div>
      </div>

      <div className="card-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-ink/5 bg-paper-tint text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                <Th>Stagiaire</Th>
                <Th>Email</Th>
                <Th>Filière</Th>
                <Th>Offre</Th>
                <Th>Entreprise</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={7}><Loader2 className="inline h-4 w-4 animate-spin" /> Chargement…</td></tr>
              )}
              {list.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0">
                    <Td className="font-semibold text-ink">{r.stagiaire}</Td>
                    <Td className="text-ink-soft">{r.email}</Td>
                    <Td className="text-ink-soft">{r.filiere}</Td>
                    <Td className="text-ink">{r.offer}</Td>
                    <Td className="text-ink-soft">{r.company}</Td>
                    <Td className="text-ink-soft">
                      {new Date(r.applied_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconBtn label="Voir le CV" onClick={() => setViewCvId(r.userId)}>
                          <Eye className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && list.length === 0 && (
            <div className="px-6 py-10 text-center text-ink-muted">Aucune candidature pour ce filtre.</div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {viewCvId && <ViewCvModal id={viewCvId} onClose={() => setViewCvId(null)} />}
      </AnimatePresence>
    </div>
  )
}

function Th({ children, className = '' }) { return <th className={`px-5 py-3 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td> }

function ViewCvModal({ id, onClose }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin', 'stagiaire', id],
    queryFn: () => getStagiaire(id),
  })
  const stagiaire = raw ? normalizeStagiaire(raw) : null
  const cvRef = useRef(null)
  const transformRef = useRef(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [zoom, setZoom] = useState(1.5)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 })

  const hasPhoto = Boolean(stagiaire?.profile?.photo_path)
  const hasCv = Boolean(stagiaire?.cv)
  const cvCompleted = hasPhoto && hasCv

  async function handleDownloadPdf() {
    const el = cvRef.current
    if (!el) return
    setDownloadingPdf(true)
    // Temporarily remove transform via DOM (no React re-render)
    const wrapper = transformRef.current
    const savedTransform = wrapper?.style.transform
    if (wrapper) wrapper.style.transform = 'none'
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
      const imgData = canvas.toDataURL('image/jpeg', 0.9)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210; const pageH = 297
      const imgW = canvas.width; const imgH = canvas.height
      const ratio = Math.min(pageW / imgW, pageH / imgH)
      const w = imgW * ratio; const h = imgH * ratio
      const x = (pageW - w) / 2; const y = (pageH - h) / 2
      pdf.addImage(imgData, 'JPEG', x, y, w, h, undefined, 'FAST')
      pdf.save(`CV_${(stagiaire.full_name || '').replace(/\s+/g, '_')}.pdf`)
      toast.success('PDF téléchargé !')
    } catch {
      toast.error('Erreur lors de la génération du PDF.')
    } finally {
      if (wrapper) wrapper.style.transform = savedTransform
      setDownloadingPdf(false)
    }
  }

  const emp = stagiaire ? (EMPLOYMENT_LABELS[stagiaire.employment_status] || EMPLOYMENT_LABELS.looking) : EMPLOYMENT_LABELS.looking

  return (
    <motion.div
      className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="fixed inset-0 bg-ink/40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="relative flex max-h-[95vh] min-h-[85vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-paper-card shadow-lift"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <header className="flex shrink-0 items-center justify-between rounded-t-3xl border-b border-ink/10 bg-paper-tint px-6 py-4">
          <div />
          <div className="flex items-center gap-2">
            {cvCompleted && (
              <>
                <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} disabled={zoom <= 0.3} className="rounded-full p-2 text-ink-subtle hover:bg-ink/10 hover:text-ink transition-colors disabled:opacity-30" title="Zoom out">
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="min-w-[3rem] text-center text-xs text-ink-subtle">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} disabled={zoom >= 1.5} className="rounded-full p-2 text-ink-subtle hover:bg-ink/10 hover:text-ink transition-colors disabled:opacity-30" title="Zoom in">
                  <ZoomIn className="h-5 w-5" />
                </button>
              </>
            )}
            <button onClick={handleDownloadPdf} disabled={downloadingPdf || !cvCompleted} className="btn-outline text-sm disabled:opacity-40">
              {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </button>
            <button onClick={onClose} className="rounded-full p-2 text-ink-subtle hover:bg-ink/10 hover:text-ink transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {isLoading || !stagiaire ? (
          <div className="flex h-64 items-center justify-center text-ink-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Profile */}
            <div className="w-[360px] shrink-0 overflow-y-auto border-r border-ink/10 p-6 space-y-5">
              <div className="flex items-center gap-4">
                {stagiaire.profile?.photo_path ? (
                  <img src={stagiaire.profile.photo_path} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-400 text-lg font-semibold text-ink">
                    {(stagiaire.full_name || '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-ink">{stagiaire.full_name}</p>
                  <p className="text-sm text-ink-muted">{stagiaire.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone={emp.tone} icon={stagiaire.employment_status === 'employed' ? Briefcase : Clock}>{emp.label}</Badge>
                <Badge tone="outline" icon={GraduationCap}>{stagiaire.filiere}</Badge>
              </div>

              <section className="space-y-3 rounded-2xl bg-paper-tint p-4 text-sm">
                <Row Icon={Mail} label="Email" value={stagiaire.email} />
                <Row Icon={Phone} label="Téléphone" value={stagiaire.phone || '—'} />
                <Row Icon={GraduationCap} label="Filière" value={stagiaire.filiere} />
                <Row Icon={Calendar} label="Promotion" value={stagiaire.promotion || '—'} />
                {stagiaire.profile?.city && <Row Icon={MapPin} label="Ville" value={stagiaire.profile.city} />}
              </section>

              {stagiaire.employment_status === 'employed' && (
                <section className="space-y-3 rounded-2xl bg-paper-tint p-4 text-sm">
                  <p className="kicker">Emploi</p>
                  <Row Icon={Briefcase} label="Poste" value={stagiaire.job_title || '—'} />
                  <Row Icon={MapPin} label="Entreprise" value={stagiaire.job_company || '—'} />
                  {stagiaire.job_start_date && (
                    <Row Icon={Calendar} label="Date de début" value={new Date(stagiaire.job_start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
                  )}
                </section>
              )}

              {stagiaire.profile?.bio && (
                <section className="rounded-2xl bg-paper-tint p-4 text-sm">
                  <p className="kicker">Profil</p>
                  <p className="mt-2 whitespace-pre-line break-anywhere text-ink-soft">{stagiaire.profile.bio}</p>
                </section>
              )}
            </div>

            {/* Right: CV */}
            <div
              className="flex-1 overflow-auto bg-paper-tint/30"
              style={{ cursor: cvCompleted ? (isPanning ? 'grabbing' : 'grab') : undefined }}
              onMouseDown={cvCompleted ? (e) => {
                setIsPanning(true)
                panStartRef.current = { x: e.pageX, y: e.pageY, px: pan.x, py: pan.y }
                function onMove(ev) {
                  setPan({
                    x: panStartRef.current.px + (ev.pageX - panStartRef.current.x),
                    y: panStartRef.current.py + (ev.pageY - panStartRef.current.y),
                  })
                }
                function onUp() {
                  setIsPanning(false)
                  window.removeEventListener('mousemove', onMove)
                  window.removeEventListener('mouseup', onUp)
                }
                window.addEventListener('mousemove', onMove)
                window.addEventListener('mouseup', onUp)
              } : undefined}
            >
              {!cvCompleted ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-ink-muted">
                  <GraduationCap className="h-12 w-12 text-ink/20" />
                  <p className="mt-4 text-lg font-medium text-ink">CV non complété</p>
                  <p className="mt-1 text-sm">
                    {!hasPhoto && !hasCv && 'Ce stagiaire n\'a pas encore ajouté de photo ni créé son CV.'}
                    {!hasPhoto && hasCv && 'Ce stagiaire n\'a pas encore ajouté de photo à son profil.'}
                    {hasPhoto && !hasCv && 'Ce stagiaire n\'a pas encore créé son CV.'}
                  </p>
                </div>
              ) : (
                <div className="flex items-start justify-center p-6 min-h-full">
                  <div ref={transformRef} className="origin-top" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
                    <div className="w-[412.77px] min-h-[600px]">
                      <CvPreview ref={cvRef} cv={toUi({ cvData: stagiaire.cv, profileData: { user: stagiaire.user, profile: stagiaire.profile } })} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="shrink-0 inline-flex items-center gap-2 text-ink-subtle"><Icon className="h-3.5 w-3.5" />{label}</span>
      <span className="min-w-0 break-anywhere text-right font-medium text-ink">{value}</span>
    </div>
  )
}
