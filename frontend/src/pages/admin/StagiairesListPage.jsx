import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Briefcase,
  Clock,
  Mail,
  Phone,
  X,
  GraduationCap,
  Loader2,
  Printer,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  Download,
} from 'lucide-react'
import { EMPLOYMENT_LABELS } from '@/mocks/data'
import { listStagiaires, getStagiaire, deleteStagiaire, downloadStagiairePdf } from '@/api/admin'
import { useFilieres } from '@/hooks/useFilieres'
import { normalizeStagiaire } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import { toast } from 'sonner'
import { CvPreview, toUi } from '@/pages/stagiaire/CvBuilderPage'

export default function StagiairesListPage() {
  const [query, setQuery] = useState('')
  const [empFilter, setEmpFilter] = useState('all')
  const [filiereFilter, setFiliereFilter] = useState('')
  const [promotionFilter, setPromotionFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [viewCvId, setViewCvId] = useState(null)

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin', 'stagiaires'],
    queryFn: () => listStagiaires(),
  })
  const { filieresList, isLoading: loadingFilieres } = useFilieres()
  const stagiaires = useMemo(() => raw.map(normalizeStagiaire), [raw])

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStagiaire(id),
    onSuccess: (_, id) => {
      toast.success('Stagiaire supprimé avec succès.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'stagiaires'] })
      if (selectedId === id) {
        setSelectedId(null)
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    },
  })

  function handleDelete(e, id) {
    e.stopPropagation()
    if (window.confirm('Voulez-vous vraiment supprimer ce stagiaire ? Cette action est irréversible et supprimera toutes ses données (CV, candidatures, etc.).')) {
      deleteMutation.mutate(id)
    }
  }

  const [downloadingId, setDownloadingId] = useState(null)

  async function handleDownloadRowPdf(e, stagiaire) {
    e.stopPropagation()
    try {
      setDownloadingId(stagiaire.id)
      const blob = await downloadStagiairePdf(stagiaire.id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `CV_${stagiaire.full_name.replace(/\s+/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      toast.error('Le PDF n\'est pas encore généré pour ce stagiaire.')
    } finally {
      setDownloadingId(null)
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

      <div className="card-raised p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:max-w-sm sm:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, email, filière)…"
              className="input w-full pl-11"
            />
          </label>
          <div className="flex items-center gap-3">
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
            <select
              className="input py-1.5 text-xs"
              value={filiereFilter}
              onChange={(e) => setFiliereFilter(e.target.value)}
            >
              <option value="">{loadingFilieres ? "Chargement..." : "Toutes filières"}</option>
              {filieresList.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <select
              className="input py-1.5 text-xs"
              value={promotionFilter}
              onChange={(e) => setPromotionFilter(e.target.value)}
            >
              <option value="">Toutes promos</option>
              {[2026, 2025, 2024, 2023, 2022, 2021].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/5 bg-paper-tint text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                <Th>Stagiaire</Th>
                <Th>Filière</Th>
                <Th>Promotion</Th>
                <Th>Niveau</Th>
                <Th>Emploi</Th>
                <Th className="text-center">Candidatures</Th>
                <Th>Inscrit le</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={6}><Loader2 className="inline h-4 w-4 animate-spin" /> Chargement…</td></tr>
              )}
              {!isLoading && list.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={8}>Aucun stagiaire.</td></tr>
              )}
              {list.map((s) => {
                const emp = EMPLOYMENT_LABELS[s.employment_status] || EMPLOYMENT_LABELS.looking
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-paper-tint/50"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-400 text-xs font-semibold text-ink">
                          {(s.full_name || '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">{s.full_name}</p>
                          <p className="text-xs text-ink-muted">{s.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-ink-soft">{s.filiere}</Td>
                    <Td className="text-xs text-ink-soft">{s.promotion}</Td>
                    <Td className="text-xs text-ink-soft">{s.niveau}</Td>
                    <Td>
                      <Badge tone={emp.tone} icon={s.employment_status === 'employed' ? Briefcase : Clock}>{emp.label}</Badge>
                    </Td>
                    <Td className="text-center font-semibold text-ink">{s.applications_count}</Td>
                    <Td className="text-ink-soft">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '—'}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewCvId(s.id)
                          }}
                          className="rounded p-2 text-ink-subtle hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          title="Voir le CV"
                          aria-label="Voir le CV"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDownloadRowPdf(e, s)}
                          disabled={downloadingId === s.id}
                          className="rounded p-2 text-ink-subtle hover:bg-brand-50 hover:text-brand-600 transition-colors disabled:opacity-50"
                          title="Télécharger le PDF"
                          aria-label="Télécharger le PDF"
                        >
                          {downloadingId === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, s.id)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === s.id}
                          className="rounded p-2 text-ink-subtle hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Supprimer le stagiaire"
                          aria-label="Supprimer le stagiaire"
                        >
                          {deleteMutation.isPending && deleteMutation.variables === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && <Drawer id={selectedId} onClose={() => setSelectedId(null)} />}
      {viewCvId && <ViewCvModal id={viewCvId} onClose={() => setViewCvId(null)} />}
    </div>
  )
}

function Th({ children, className = '' }) { return <th className={`px-5 py-3 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td> }

function Drawer({ id, onClose }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin', 'stagiaire', id],
    queryFn: () => getStagiaire(id),
  })
  const stagiaire = raw ? normalizeStagiaire(raw) : null

  function handlePrint() {
    const url = `/admin/stagiaires/${id}/cv/print`
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) {
      toast.error("Autorisez les pop-ups pour imprimer le CV.")
    }
  }

  const [downloadingPdf, setDownloadingPdf] = useState(false)

  async function handleDownloadPdf() {
    try {
      setDownloadingPdf(true)
      const blob = await downloadStagiairePdf(id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `CV_${stagiaire.full_name.replace(/\s+/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      toast.error('Le PDF n\'est pas encore généré pour ce stagiaire.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteStagiaire(id),
    onSuccess: () => {
      toast.success('Stagiaire supprimé avec succès.')
      queryClient.invalidateQueries(['admin', 'stagiaires'])
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    },
  })

  function handleDelete() {
    if (window.confirm('Voulez-vous vraiment supprimer ce stagiaire ? Cette action est irréversible et supprimera toutes ses données (CV, candidatures, etc.).')) {
      deleteMutation.mutate()
    }
  }

  const emp = stagiaire ? (EMPLOYMENT_LABELS[stagiaire.employment_status] || EMPLOYMENT_LABELS.looking) : EMPLOYMENT_LABELS.looking

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-paper-card p-6 shadow-lift">
        <button onClick={onClose} aria-label="Fermer" className="self-end rounded-full p-2 text-ink-subtle hover:bg-ink/5 hover:text-ink">
          <X className="h-5 w-5" />
        </button>

        {isLoading || !stagiaire ? (
          <div className="flex flex-1 items-center justify-center text-ink-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="mt-2 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-400 text-lg font-semibold text-ink">
                {(stagiaire.full_name || '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <div>
                <h2 className="display text-2xl text-ink">{stagiaire.full_name}</h2>
                <p className="text-sm text-ink-muted">{stagiaire.filiere}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone={emp.tone} icon={stagiaire.employment_status === 'employed' ? Briefcase : Clock}>{emp.label}</Badge>
              <Badge tone="outline" icon={GraduationCap}>{stagiaire.niveau}</Badge>
            </div>

            <section className="mt-6 space-y-3 rounded-2xl bg-paper-tint p-4 text-sm">
              <Row Icon={Mail} label="Email" value={stagiaire.email} />
              <Row Icon={Phone} label="Téléphone" value={stagiaire.phone || '—'} />
              <Row Icon={GraduationCap} label="Filière" value={stagiaire.filiere} />
              <Row Icon={Calendar} label="Promotion" value={stagiaire.promotion || '—'} />
            </section>

            {stagiaire.employment_status === 'employed' && (
              <section className="mt-6 space-y-3 rounded-2xl bg-paper-tint p-4 text-sm">
                <p className="kicker">Emploi</p>
                <Row Icon={Briefcase} label="Poste" value={stagiaire.job_title || '—'} />
                <Row Icon={MapPin} label="Entreprise" value={stagiaire.job_company || '—'} />
                <Row Icon={MapPin} label="Ville" value={stagiaire.job_city || '—'} />
                {stagiaire.job_start_date && (
                  <Row Icon={Calendar} label="Date de début" value={new Date(stagiaire.job_start_date).toLocaleDateString('fr-FR')} />
                )}
              </section>
            )}

            <div className="mt-auto space-y-2 border-t border-ink/5 pt-5">
              <button
                onClick={handlePrint}
                className="btn-outline w-full justify-center"
              >
                <Printer className="h-4 w-4" />
                Imprimer le CV
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="btn-outline w-full justify-center"
              >
                {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Télécharger le PDF
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-outline w-full justify-center text-red-600 ring-red-600/20 hover:bg-red-50 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer le stagiaire
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-ink-subtle"><Icon className="h-3.5 w-3.5" />{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  )
}

function ViewCvModal({ id, onClose }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin', 'stagiaire', id],
    queryFn: () => getStagiaire(id),
  })

  const stagiaire = raw ? normalizeStagiaire(raw) : null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-ink/10 bg-paper-tint px-6 py-4">
          <h2 className="display text-xl text-ink">
            CV de <span className="text-brand-600">{stagiaire?.full_name || '...'}</span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink-subtle hover:bg-ink/10 hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-paper-tint/30 p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-ink-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !stagiaire?.cv ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-ink-muted">
              <p className="text-lg font-medium text-ink">Aucun CV</p>
              <p className="text-sm">Ce stagiaire n'a pas encore créé son CV.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-[210mm] shadow-sm">
              <CvPreview cv={toUi({ cvData: stagiaire.cv, profileData: { user: stagiaire.user, profile: stagiaire.profile } })} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
