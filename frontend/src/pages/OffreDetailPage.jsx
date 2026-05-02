import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  FileX,
  Loader2,
} from 'lucide-react'
import { getPublicOffer } from '@/api/offers'
import { applyToOffer, listMyApplications } from '@/api/applications'
import { getMyProfile } from '@/api/profile'
import { getMyCv } from '@/api/cv'
import { normalizeOffer } from '@/lib/normalizers'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

const DASH = '—'

export default function OffreDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['offers', 'public', id],
    queryFn: () => getPublicOffer(id),
    enabled: Boolean(id),
    retry: false,
  })
  const offer = data ? normalizeOffer(data) : null

  const isStagiaire = !!(token && user?.role === 'stagiaire')

  const { data: myApps = [] } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: listMyApplications,
    enabled: isStagiaire,
  })
  const alreadyApplied = myApps.some((a) => a.offer?.id === Number(id))

  const { data: profileData } = useQuery({
    queryKey: ['me', 'profile'],
    queryFn: getMyProfile,
    enabled: isStagiaire,
    staleTime: 0,
  })
  const myProfile = profileData?.profile
  const myUser = profileData?.user
  const missingProfile = []
  if (isStagiaire && myUser && myProfile) {
    if (!myUser.first_name?.trim()) missingProfile.push('Prénom')
    if (!myUser.last_name?.trim()) missingProfile.push('Nom')
    if (!myUser.email?.trim()) missingProfile.push('Email')
    if (!myUser.phone?.trim()) missingProfile.push('Téléphone')
    if (!myProfile.filiere?.trim()) missingProfile.push('Filière')
    if (!myProfile.promotion) missingProfile.push('Promotion')
    if (!myProfile.bio?.trim()) missingProfile.push('Profil')
    if (!myProfile.photo_path) missingProfile.push('Photo')
  }
  const profileCompleted = missingProfile.length === 0
  const myFiliere = myProfile?.filiere || ''

  const { data: cvData } = useQuery({
    queryKey: ['me', 'cv'],
    queryFn: getMyCv,
    enabled: isStagiaire,
    staleTime: 0,
  })
  const cvFinalized = !!cvData?.is_finalized

  const applyMutation = useMutation({
    mutationFn: () => applyToOffer(id),
    onSuccess: () => {
      toast.success(`Candidature envoyée pour "${offer.title}"`)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error) => {
      const errs = error?.response?.data?.errors
      const msg =
        errs?.profile?.[0] ||
        errs?.cv?.[0] ||
        errs?.filiere?.[0] ||
        errs?.offer?.[0] ||
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

  const typeIcon = offer.type === 'stage' ? GraduationCap : Briefcase

  function handleApply() {
    if (!token) {
      navigate('/inscription')
      return
    }
    if (user.role !== 'stagiaire') {
      toast.error('Les candidatures sont réservées aux stagiaires.')
      return
    }
    if (!profileCompleted) {
      navigate('/espace/profil')
      return
    }
    if (!cvFinalized) {
      navigate('/espace/cv')
      return
    }
    // Check filiere match client-side for instant feedback
    if (offer.filiere && myFiliere && offer.filiere !== DASH) {
      if (offer.filiere.toLowerCase().trim() !== myFiliere.toLowerCase().trim()) {
        toast.error('Cette offre ne correspond pas à votre filière.')
        return
      }
    }
    applyMutation.mutate()
  }

  return (
    <div className="relative">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/offres"
          className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les offres
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={offer.type === 'stage' ? 'accent' : 'brand'} icon={typeIcon}>
                {offer.type === 'stage' ? 'Stage' : 'Emploi'}
              </Badge>
              <Badge tone="outline" icon={MapPin}>
                {offer.city}
              </Badge>
            </div>

            <h1 className="display mt-5 text-display-lg text-ink">
              {offer.title}
            </h1>
            <p className="mt-3 text-lg text-ink-muted">
              {offer.company}
            </p>

            <section className="mt-10">
              <h2 className="display text-display-md text-ink">Description</h2>
              <p className="mt-3 leading-relaxed text-ink-soft whitespace-pre-line break-words">
                {offer.description}
              </p>
            </section>

          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card-raised p-6">
              <p className="kicker">Récapitulatif</p>
              <dl className="mt-5 space-y-3 text-sm">
                <Row Icon={Building2} label="Entreprise" value={offer.company} />
                <Row Icon={MapPin} label="Lieu" value={offer.city} />
                <Row Icon={GraduationCap} label="Filière" value={offer.filiere} />
                <Row Icon={Calendar} label="Clôture" value={offer.deadline ? new Date(offer.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Non définie'} />
              </dl>
              <button
                onClick={handleApply}
                className="btn-primary mt-5 w-full"
                disabled={applyMutation.isPending || alreadyApplied}
              >
                {applyMutation.isPending
                  ? 'Envoi…'
                  : alreadyApplied
                    ? <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Déjà postulé</span>
                    : isStagiaire
                      ? !profileCompleted
                        ? 'Compléter profil'
                        : !cvFinalized
                          ? 'Finaliser CV'
                          : 'Postuler maintenant'
                      : token
                        ? 'Réservé aux stagiaires'
                        : 'Créer un compte pour postuler'}
              </button>

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
