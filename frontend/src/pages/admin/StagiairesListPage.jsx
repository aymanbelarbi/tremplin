import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
} from 'lucide-react'
import { EMPLOYMENT_LABELS } from '@/mocks/data'
import { FILIERES } from '@/lib/filieres'
import { listStagiaires, getStagiaire } from '@/api/admin'
import { normalizeStagiaire } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import { toast } from 'sonner'

export default function StagiairesListPage() {
  const [query, setQuery] = useState('')
  const [empFilter, setEmpFilter] = useState('all')
  const [filiereFilter, setFiliereFilter] = useState('')
  const [promotionFilter, setPromotionFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin', 'stagiaires'],
    queryFn: () => listStagiaires(),
  })
  const stagiaires = useMemo(() => raw.map(normalizeStagiaire), [raw])

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
              <option value="">Toutes filières</option>
              {FILIERES.map((f) => (
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
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={6}><Loader2 className="inline h-4 w-4 animate-spin" /> Chargement…</td></tr>
              )}
              {!isLoading && list.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={6}>Aucun stagiaire.</td></tr>
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && <Drawer id={selectedId} onClose={() => setSelectedId(null)} />}
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
