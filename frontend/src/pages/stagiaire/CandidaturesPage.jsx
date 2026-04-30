import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  MapPin,
  Clock,
  ArrowUpRight,
  Loader2,
  Trash2,
  Briefcase,
} from 'lucide-react'
import { listMyApplications, cancelApplication } from '@/api/applications'
import { normalizeApplication } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import { toast } from 'sonner'

export default function CandidaturesPage() {
  const queryClient = useQueryClient()

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: listMyApplications,
  })

  const applications = useMemo(() => raw.map(normalizeApplication), [raw])

  const cancelMutation = useMutation({
    mutationFn: cancelApplication,
    onSuccess: () => {
      toast.success('Candidature annulée.')
      queryClient.invalidateQueries({ queryKey: ['applications', 'me'] })
    },
    onError: () => toast.error("Impossible d'annuler cette candidature."),
  })

  const list = applications

  function handleCancel(id, e) {
    e.preventDefault()
    if (window.confirm('Voulez-vous vraiment annuler cette candidature ?')) {
      cancelMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Espace stagiaire"
        title={<>Mes <span className="display-italic text-brand-600">candidatures</span></>}
        description="Retrouvez ici les offres auxquelles vous avez postulé. L'entreprise vous contactera directement si votre profil les intéresse."
        actions={
          <Link to="/offres" className="btn-primary">
            <Briefcase className="h-4 w-4" />
            Voir les offres
          </Link>
        }
      />



      <div className="space-y-3">
        {isLoading && (
          <div className="card flex items-center justify-center gap-2 p-8 text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </div>
        )}

        {!isLoading && applications.length === 0 && (
          <div className="card flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/5 text-ink-subtle">
              <Briefcase className="h-8 w-8" />
            </div>
            <div className="max-w-xs">
              <p className="font-display text-lg font-medium text-ink">Aucune candidature</p>
              <p className="mt-1 text-sm text-ink-muted">
                Vous n'avez pas encore postulé à des offres d'emploi.
              </p>
            </div>
          </div>
        )}

        {list.map((a) => (
          <Link
            key={a.id}
            to={`/offres/${a.offer_id}`}
            className="card-raised group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Building2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-medium text-ink">
                  {a.offer_title}
                </p>
                <p className="truncate text-sm text-ink-muted">{a.company}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.city}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Postulé le {new Date(a.applied_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleCancel(a.id, e)}
                disabled={cancelMutation.isPending}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-red-50 hover:text-red-600"
                title="Annuler la candidature"
              >
                {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
              <ArrowUpRight className="h-4 w-4 text-ink-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}

        {!isLoading && applications.length > 0 && list.length === 0 && (
          <div className="card p-8 text-center text-ink-muted">
            Aucune candidature pour cette recherche.
          </div>
        )}
      </div>
    </div>
  )
}
