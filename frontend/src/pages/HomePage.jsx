import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  GraduationCap,
  Search,
  Sparkles,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CtaBand />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-spotlight" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-grid-fade" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28 lg:pt-36">
        <div className="relative reveal grid items-center gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <span className="kicker">
              Plateforme Tremplin · ISTA Khemisset
            </span>

            <h1 className="display mt-6 text-display-xl text-ink">
              Votre profil,<br className="hidden sm:block" />{' '}
              <span className="display-italic text-brand-600">votre tremplin</span>{' '}
              vers l'emploi.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Créez votre profil, construisez votre CV, et postulez aux offres
              d'emploi de l'ISTA Khemisset.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/inscription" className="btn-primary text-base hover:bg-ink hover:shadow-lift cursor-pointer">
                Créer mon compte
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/offres" className="btn text-base text-ink ring-1 ring-ink/15 bg-white">
                Voir les offres
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <img src="/logo.svg" alt="Tremplin" className="h-48 w-48 lg:h-64 lg:w-64 drop-shadow-lg" />
          </div>
        </div>

      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="relative border-y border-ink/10 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-none bg-ink/10 md:grid-cols-4">
        <Stat value="CV" label="Moderne" hint="Construisez et téléchargez en un clic" />
        <Stat value="Offres" label="Exclusives" hint="Offres d'emploi de l'ISTA" />
        <Stat value="Emploi" label="Suivi" hint="Employé ou en recherche" />
        <Stat value="Candidature" label="Simplifiée" hint="Postulez avec votre CV" />
      </div>
    </section>
  )
}

function Stat({ value, label, hint }) {
  return (
    <div className="bg-white p-8">
      <div className="display text-display-md text-ink">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-subtle">
        {label}
      </div>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>
    </div>
  )
}

function Features() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="kicker">Ce que vous obtenez</span>
        <h2 className="display mt-4 text-display-lg text-ink">
          Tout le <span className="display-italic text-brand-600">nécessaire</span> pour décrocher votre prochaine opportunité.
        </h2>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-6">
        <div className="lg:col-span-4 card-raised relative overflow-hidden p-8 reveal">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="kicker">01 · Espace stagiaire</span>
              <h3 className="mt-4 text-2xl font-semibold text-ink">Pour les stagiaires</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                Profil complet, CV moderne au format PDF, candidatures en un clic
                et contact direct avec les recruteurs.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                <Bullet>Création de CV avec aperçu en direct</Bullet>
                <Bullet>Indiquez si vous avez trouvé un emploi</Bullet>
                <Bullet>Historique clair de vos candidatures envoyées</Bullet>
              </ul>
            </div>
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-paper shadow-pop">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-brand-100 blur-3xl"
          />
        </div>

        <div className="lg:col-span-2 card-raised p-8 reveal reveal-delay-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper">
            <Briefcase className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-ink">Offres d'emploi</h3>
          <p className="mt-2 text-sm text-ink-muted">
            Offres d'emploi publiées par l'administration, filtrées par filière
            et type de contrat.
          </p>
        </div>

        <div className="lg:col-span-2 card-ink p-8 reveal reveal-delay-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400 text-ink">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-paper">Suivi d'emploi</h3>
          <p className="mt-2 text-sm text-paper/70">
            Indiquez votre situation professionnelle — employé ou en recherche —
            et partagez les détails de votre poste.
          </p>
        </div>

        <div className="lg:col-span-4 card-raised relative overflow-hidden p-8 reveal reveal-delay-3">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="kicker">04 · Sécurité</span>
              <h3 className="mt-4 text-2xl font-semibold text-ink">
                Données protégées, décisions traçables.
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
                Tokens Sanctum, contrôle d'accès par rôle, données protégées.
                L'administration centralise et partage vos profils aux entreprises partenaires.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.15em] text-ink-subtle">
              <TagBadge label="RGPD" />
              <TagBadge label="HTTPS" />
              <TagBadge label="RBAC" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
      {children}
    </li>
  )
}

function TagBadge({ label }) {
  return (
    <span className="rounded-full border border-ink/10 px-3 py-1 text-[10px] text-ink-soft">
      {label}
    </span>
  )
}

function HowItWorks() {
  return (
    <section id="comment" className="relative bg-paper-tint/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <span className="kicker">Comment ça marche</span>
            <h2 className="display mt-4 text-display-lg text-ink">
              De l'inscription à l'entretien, <span className="display-italic text-brand-600">en 3 étapes</span>.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Un parcours guidé, sans page superflue. Indiquez votre situation,
              construisez votre CV, et postulez.
            </p>
          </div>

          <div className="grid gap-5">
            <Step
              n="01"
              icon={Briefcase}
              title="Inscrivez-vous et indiquez votre situation"
              text="Employé ou en recherche ? Partagez les détails de votre poste si vous avez trouvé un emploi."
            />
            <Step
              n="02"
              icon={Sparkles}
              title="Construisez votre CV en temps réel"
              text="Un formulaire, un aperçu live. Téléchargement PDF en un clic, prêt à être partagé."
            />
            <Step
              n="03"
              icon={Briefcase}
              title="Postulez et soyez contacté"
              text="Postulez aux offres en un clic. Vos coordonnées et votre CV sont directement partagés avec les recruteurs."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Step({ n, icon: Icon, title, text }) {
  return (
    <div className="card-raised group flex items-start gap-5 p-6">
      <div className="flex flex-col items-center">
        <span className="display text-2xl text-brand-600">{n}</span>
        <span className="mt-2 h-full w-px flex-1 bg-ink/10 group-last:hidden" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-600" />
          <h3 className="text-base font-semibold text-ink">{title}</h3>
        </div>
        <p className="mt-1.5 text-sm text-ink-muted">{text}</p>
      </div>
    </div>
  )
}

function CtaBand() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-8 pt-24">
      <div className="card-ink relative overflow-hidden p-10 md:p-14">
        <div className="relative z-10 grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-400" />
              Prêt à commencer ?
            </span>
            <h2 className="display mt-4 text-display-lg text-paper">
              Votre prochaine opportunité n'attend que vous.
            </h2>
            <p className="mt-3 max-w-xl text-paper/70">
              Créez un compte gratuit sur la plateforme de l'ISTA Khemisset, et accédez dès
              aujourd'hui aux offres disponibles.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/inscription" className="btn-accent text-base w-full">
              Créer mon compte
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/connexion"
              className="btn w-full text-paper ring-1 ring-paper/20 hover:bg-paper/10"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl"
        />
      </div>

      <p className="sr-only">
        Le tremplin vers votre carrière.
      </p>
    </section>
  )
}
