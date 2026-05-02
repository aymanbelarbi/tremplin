import { useMemo, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  Briefcase,
  Clock,
  Mail,
  Phone,
  X,
  GraduationCap,
  Loader2,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { EMPLOYMENT_LABELS } from '@/mocks/data'
import { listStagiaires, getStagiaire, deleteStagiaire } from '@/api/admin'
import { useFilieres } from '@/hooks/useFilieres'
import { normalizeStagiaire } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import IconBtn from '@/components/ui/IconBtn'
import GroupedSelect from '@/components/ui/GroupedSelect'
import { toast } from 'sonner'
import { CvPreview, toUi } from '@/pages/stagiaire/CvBuilderPage'

export default function StagiairesListPage() {
  const [query, setQuery] = useState('')
  const [empFilter, setEmpFilter] = useState('all')
  const [filiereFilter, setFiliereFilter] = useState('')
  const [promotionFilter, setPromotionFilter] = useState('')
  const [viewCvId, setViewCvId] = useState(null)

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin', 'stagiaires'],
    queryFn: () => listStagiaires(),
  })
  const { filiereGroups, isLoading: loadingFilieres } = useFilieres()
  const stagiaires = useMemo(() => raw.map(normalizeStagiaire), [raw])

  const promotions = useMemo(() => {
    const years = stagiaires
      .map((s) => s.promotion)
      .filter((p) => p && p !== '—')
      .map(Number)
      .filter(Boolean)
    return [...new Set(years)].sort((a, b) => b - a)
  }, [stagiaires])

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStagiaire(id),
    onSuccess: () => {
      toast.success('Stagiaire supprimé avec succès.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'stagiaires'] })
    },
    onError: () => {
      toast.error('Erreur lors de la suppression.')
    },
  })

  function handleDelete(e, id) {
    e.stopPropagation()
    if (window.confirm('Voulez-vous vraiment supprimer ce stagiaire ? Cette action est irréversible et supprimera toutes ses données (CV, candidatures, etc.).')) {
      deleteMutation.mutate(id)
    }
  }

  const list = useMemo(() => {
    return stagiaires.filter((s) => {
      if (empFilter !== 'all' && s.employment_status !== empFilter) return false
      if (filiereFilter && s.filiere !== filiereFilter) return false
      if (promotionFilter && String(s.promotion) !== promotionFilter) return false
      if (query) {
        const q = query.toLowerCase()
        if (
          !s.full_name?.toLowerCase().includes(q) &&
          !s.email?.toLowerCase().includes(q) &&
          !(s.phone || '').toLowerCase().includes(q) &&
          !(s.filiere || '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [stagiaires, query, empFilter, filiereFilter, promotionFilter])

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Administration"
        title={<>Liste des <span className="display-italic text-brand-600">stagiaires</span></>}
        description="Parcourez les profils et suivez leur situation professionnelle."
      />

      <div className="card-raised p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, email, téléphone, filière…"
              className="input w-full pl-11"
            />
          </label>
          <div className="flex items-center rounded-full bg-ink/5 p-1">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'employed', label: 'Employés' },
              { id: 'looking', label: 'En recherche' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEmpFilter(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  empFilter === f.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-1/2">
            <GroupedSelect
              id="filter-filiere"
              placeholder={loadingFilieres ? 'Chargement...' : 'Toutes filières'}
              groups={[
                { parent: '', options: [{ label: 'Toutes filières', value: '' }] },
                ...filiereGroups.map((g) => ({
                  parent: g.parent,
                  options: g.options.map((o) => ({ label: o, value: o })),
                })),
              ]}
              value={filiereFilter}
              onChange={(v) => setFiliereFilter(v)}
            />
          </div>
          <div className="w-1/2">
            <GroupedSelect
              id="filter-promotion"
              placeholder="Toutes"
              groups={[
                { parent: '', options: [{ label: 'Toutes promotions', value: '' }] },
                {
                  parent: 'Promotions',
                  options: promotions.map((y) => ({ label: String(y), value: String(y) })),
                },
              ]}
              value={promotionFilter}
              onChange={(v) => setPromotionFilter(v)}
            />
          </div>
        </div>
      </div>

      <div className="card-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-ink/5 bg-paper-tint text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                <Th>Stagiaire</Th>
                <Th>Email</Th>
                <Th>Filière</Th>
                <Th>Promotion</Th>
                <Th>Emploi</Th>
                <Th>Inscrit le</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={7}><Loader2 className="inline h-4 w-4 animate-spin" /> Chargement…</td></tr>
              )}
              {!isLoading && list.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={7}>Aucun stagiaire.</td></tr>
              )}
              {list.map((s) => {
                const emp = EMPLOYMENT_LABELS[s.employment_status] || EMPLOYMENT_LABELS.looking
                return (
                  <tr
                    key={s.id}
                    className="border-b border-ink/5 last:border-0"
                  >
                    <Td className="font-semibold text-ink">{s.full_name}</Td>
                    <Td className="text-ink-soft">{s.email}</Td>
                    <Td className="text-ink-soft">{s.filiere}</Td>
                    <Td className="text-ink-soft">{s.promotion || '—'}</Td>
                    <Td>
                      <Badge tone={emp.tone} icon={s.employment_status === 'employed' ? Briefcase : Clock}>{emp.label}</Badge>
                    </Td>
                    <Td className="text-ink-soft">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconBtn label="Voir le profil et CV" onClick={(e) => { e.stopPropagation(); setViewCvId(s.id) }}>
                          <Eye className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn label="Supprimer" danger onClick={(e) => handleDelete(e, s.id)} disabled={deleteMutation.isPending && deleteMutation.variables === s.id}>
                          {deleteMutation.isPending && deleteMutation.variables === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {viewCvId && <StagiaireDetailModal id={viewCvId} onClose={() => setViewCvId(null)} />}
      </AnimatePresence>
    </div>
  )
}

function Th({ children, className = '' }) { return <th className={`px-5 py-3 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td> }

function StagiaireDetailModal({ id, onClose }) {
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
                <button
                  onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
                  disabled={zoom <= 0.3}
                  className="rounded-full p-2 text-ink-subtle hover:bg-ink/10 hover:text-ink transition-colors disabled:opacity-30"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="min-w-[3rem] text-center text-xs text-ink-subtle">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                  disabled={zoom >= 1.5}
                  className="rounded-full p-2 text-ink-subtle hover:bg-ink/10 hover:text-ink transition-colors disabled:opacity-30"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || !cvCompleted}
              className="btn-outline text-sm disabled:opacity-40"
            >
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
