import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Share2,
  Bookmark,
  Users,
  FileX,
  Loader2,
} from 'lucide-react'
import { getPublicOffer } from '@/api/offers'
import { applyToOffer } from '@/api/applications'
import { normalizeOffer } from '@/lib/normalizers'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export default function OffreDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['offers', 'public', id],
    queryFn: () => getPublicOffer(id),
    enabled: Boolean(id),
    retry: false,
  })
  const offer = data ? normalizeOffer(data) : null

  const applyMutation = useMutation({
    mutationFn: () => applyToOffer(id),
    onSuccess: () => {
      toast.success(`Candidature envoyée pour "${offer.title}"`)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.errors?.profile?.[0] ||
        error?.response?.data?.errors?.offer?.[0] ||
        error?.response?.data?.message ||
        'Impossible d\'envoyer la candidature.'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center text-ink-muted">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        <p className="mt-3">Chargement de l'offre…</p>
      </div>
    )
  }

  if (isError || !offer) {
    return (
      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5 text-ink-subtle">
          <FileX className="h-6 w-6" />
        </span>
        <h1 className="display mt-6 text-display-md text-ink">
          Offre introuvable
        </h1>
        <p className="mt-3 text-ink-muted">
          Cette offre n'existe plus ou le lien est incorrect. Elle a peut-être été archivée.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link to="/offres" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Toutes les offres
          </Link>
        </div>
      </div>
    )
  }

  const isStagiaire = token && user?.role === 'stagiaire'
  const typeIcon = offer.type === 'stage' ? GraduationCap : Briefcase

  function handleApply() {
    if (!token) {
      toast.error('Connectez-vous pour postuler.')
      return
    }
    if (user.role !== 'stagiaire') {
      toast.error('Les candidatures sont réservées aux stagiaires.')
      return
    }
    applyMutation.mutate()
  }

  return (
    <div className="relative">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <Link
          to="/offres"
          className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les offres
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <article>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={offer.type === 'stage' ? 'accent' : 'brand'} icon={typeIcon}>
                {offer.type === 'stage' ? 'Stage' : 'Emploi'}
              </Badge>
              <Badge tone="outline" icon={MapPin}>
                {offer.city} · {offer.remote}
              </Badge>
              <Badge tone="outline" icon={Clock}>
                {offer.duration}
              </Badge>
            </div>

            <h1 className="display mt-5 text-display-lg text-ink">
              {offer.title}
            </h1>
            <p className="mt-3 text-lg text-ink-muted">
              {offer.company} — {offer.filiere}
            </p>

            <section className="mt-10">
              <h2 className="display text-display-md text-ink">Le poste</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {offer.description}
              </p>
            </section>

            <section className="mt-10">
              <h2 className="display text-display-md text-ink">Missions</h2>
              <ul className="mt-4 space-y-3">
                {offer.missions.map((m) => (
                  <li key={m} className="flex items-start gap-3">
                    <span className="mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-ink-soft">{m}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="display text-display-md text-ink">Compétences recherchées</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {offer.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-ink/10 bg-paper-card px-3 py-1 text-sm font-medium text-ink-soft"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-10 card p-6">
              <h2 className="display text-display-md text-ink">À propos de {offer.company}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Partenaire de longue date de l'ISTA Khemisset, {offer.company} recrute régulièrement des stagiaires et jeunes diplômés issus de nos filières. Les précédentes candidatures issues de la plateforme ont un taux d'acceptation de 42 %.
              </p>
            </section>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card-raised p-6">
              <p className="kicker">Récapitulatif</p>
              <dl className="mt-5 space-y-3 text-sm">
                <Row Icon={Building2} label="Entreprise" value={offer.company} />
                <Row Icon={MapPin} label="Lieu" value={`${offer.city} · ${offer.remote}`} />
                <Row Icon={Clock} label="Durée" value={offer.duration} />
                <Row Icon={Calendar} label="Clôture" value={offer.deadline ? new Date(offer.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'Non définie'} />
                <Row Icon={Users} label="Candidats" value={`${offer.applicants} en lice`} />
              </dl>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-paper-tint px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">Rémunération</span>
                <span className="font-display text-xl font-medium text-ink">{offer.salary}</span>
              </div>

              <button
                onClick={handleApply}
                className="btn-primary mt-5 w-full"
                disabled={!isStagiaire || applyMutation.isPending}
              >
                {applyMutation.isPending
                  ? 'Envoi…'
                  : isStagiaire
                    ? 'Postuler maintenant'
                    : token
                      ? 'Réservé aux stagiaires'
                      : 'Connectez-vous pour postuler'}
              </button>
              {!token && (
                <p className="mt-3 text-center text-xs text-ink-subtle">
                  Pas encore inscrit ?{' '}
                  <Link to="/inscription" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
                    Créer un compte
                  </Link>
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <button className="btn-ghost justify-center border border-ink/10">
                  <Bookmark className="h-4 w-4" />
                  Sauver
                </button>
                <button className="btn-ghost justify-center border border-ink/10">
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink-soft">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          {label}
        </dt>
        <dd className="mt-0.5 truncate font-medium text-ink">{value}</dd>
      </div>
    </div>
  )
}
