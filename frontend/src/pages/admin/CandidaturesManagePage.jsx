import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  CheckCircle2,
  XCircle,
  Hourglass,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { STATUS_LABELS } from '@/mocks/data'
import { listAdminApplications, decideApplication } from '@/api/applications'
import { normalizeAdminApplication } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'

const STATUS_ICON = {
  pending: Hourglass,
  accepted: CheckCircle2,
  refused: XCircle,
}

export default function CandidaturesManagePage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: () => listAdminApplications(),
  })
  const rows = useMemo(() => raw.map(normalizeAdminApplication), [raw])

  const decideMut = useMutation({
    mutationFn: ({ id, status }) => decideApplication(id, { status: status === 'refused' ? 'rejected' : status }),
    onSuccess: (_d, vars) => {
      toast.success(vars.status === 'accepted' ? 'Candidature acceptée.' : 'Candidature refusée.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
    onError: () => toast.error('Action impossible.'),
  })

  const list = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false
      if (query) {
        const q = query.toLowerCase()
        if (!(r.stagiaire || '').toLowerCase().includes(q) && !(r.offer || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [rows, filter, query])

  function setStatus(id, status) {
    decideMut.mutate({ id, status })
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Administration"
        title={<>Gestion des <span className="display-italic text-brand-600">candidatures</span></>}
        description="Parcourez les candidatures reçues et statuez directement depuis le tableau."
      />

      <div className="card-raised p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:max-w-sm sm:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (stagiaire, offre)…"
              className="input w-full pl-11"
            />
          </label>
          <div className="flex items-center rounded-full bg-ink/5 p-1">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'pending', label: 'En attente' },
              { id: 'accepted', label: 'Acceptées' },
              { id: 'refused', label: 'Refusées' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
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
                <Th>Offre</Th>
                <Th>Entreprise</Th>
                <Th>Date</Th>
                <Th>Statut</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={7}><Loader2 className="inline h-4 w-4 animate-spin" /> Chargement…</td></tr>
              )}
              {list.map((r) => {
                const s = STATUS_LABELS[r.status]
                const Icon = STATUS_ICON[r.status]
                return (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-tint/50">
                    <Td className="font-semibold text-ink">{r.stagiaire}</Td>
                    <Td className="text-ink-soft">{r.filiere}</Td>
                    <Td className="text-ink">{r.offer}</Td>
                    <Td className="text-ink-soft">{r.company}</Td>
                    <Td className="text-ink-soft">
                      {new Date(r.applied_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </Td>
                    <Td>
                      <Badge tone={s.tone} icon={Icon}>{s.label}</Badge>
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconBtn
                          label="Accepter"
                          tone="brand"
                          disabled={r.status === 'accepted' || decideMut.isPending}
                          onClick={() => setStatus(r.id, 'accepted')}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </IconBtn>
                        <IconBtn
                          label="Refuser"
                          tone="danger"
                          disabled={r.status === 'refused' || decideMut.isPending}
                          onClick={() => setStatus(r.id, 'refused')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!isLoading && list.length === 0 && (
            <div className="px-6 py-10 text-center text-ink-muted">Aucune candidature pour ce filtre.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Th({ children, className = '' }) { return <th className={`px-5 py-3 ${className}`}>{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td> }

function IconBtn({ children, label, onClick, tone, disabled }) {
  const cls = {
    brand: 'border-brand-200 text-brand-700 hover:bg-brand-50',
    danger: 'border-ink/10 text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-700',
    default: 'border-ink/10 text-ink-soft hover:bg-ink/5 hover:text-ink',
  }[tone || 'default']
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  )
}
