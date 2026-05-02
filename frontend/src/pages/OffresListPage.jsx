import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  MapPin,
  Briefcase,
  ArrowUpRight,
  Filter,
  Clock,
  Loader2,
  GraduationCap,
} from 'lucide-react'
import { useFilieres } from '@/hooks/useFilieres'
import { listPublicOffers } from '@/api/offers'
import { normalizeOffer } from '@/lib/normalizers'
import GroupedSelect from '@/components/ui/GroupedSelect'

export default function OffresListPage() {
  const [query, setQuery] = useState('')
  const [filiere, setFiliere] = useState('all')
  const { filiereGroups, isLoading: loadingFilieres } = useFilieres()

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['offers', 'public', { query, filiere }],
    queryFn: () =>
      listPublicOffers({
        search: query || undefined,
        filiere: filiere !== 'all' ? filiere : undefined,
      }),
  })

  const filtered = useMemo(() => raw.map(normalizeOffer), [raw])

  return (
    <div className="relative">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-8">
          <div>
            <span className="kicker">Opportunités</span>
            <h1 className="display mt-4 text-4xl lg:text-6xl text-ink leading-[1.1]">
              Propulsez votre <span className="display-italic text-brand-600">avenir professionnel</span>
              <br />vers de nouveaux horizons
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink-soft leading-relaxed">
              Découvrez des opportunités exclusives sélectionnées par l'ISTA Khemisset pour ses talents. Filtrez par filière et localisation pour trouver votre prochain défi.
            </p>
          </div>

          <div className="card-raised grid gap-4 p-5 md:grid-cols-[1fr_300px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Poste, entreprise, mots-clés..."
                className="input w-full pl-12 h-12"
              />
            </label>

            <GroupedSelect
              id="filiere-filter"
              label=""
              placeholder={loadingFilieres ? "Chargement..." : "Toutes les filières"}
              groups={[
                {
                  parent: 'Toutes les filières',
                  options: [{ label: 'Toutes les filières', value: 'all' }]
                },
                ...filiereGroups.map((g) => ({
                  parent: g.parent,
                  options: g.options.map((o) => ({ label: o, value: o })),
                }))
              ]}
              value={filiere}
              onChange={setFiliere}
              className="h-12"
            />
          </div>

          <div className="flex items-center justify-between border-b border-ink/5 pb-4 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-600" />
              <span className="font-bold text-ink">{filtered.length}</span>{' '}
              offre{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle italic">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Mise à jour en direct
            </span>
          </div>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {isLoading && (
            <div className="card col-span-full flex h-64 flex-col items-center justify-center gap-3 text-ink-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              <p className="font-medium">Chargement des meilleures offres…</p>
            </div>
          )}
          {!isLoading && filtered.map((o) => <OfferCard key={o.id} offer={o} />)}
          {!isLoading && filtered.length === 0 && (
            <div className="card col-span-full flex h-64 flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-ink/5 p-4">
                <Search className="h-8 w-8 text-ink-subtle" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">Aucun résultat</p>
                <p className="text-sm text-ink-muted">Essayez de modifier vos filtres pour voir plus d'offres.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function OfferCard({ offer }) {
  return (
    <Link
      to={`/offres/${offer.id}`}
      className="card-raised group flex flex-col p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">
          {offer.type === 'stage' ? <GraduationCap className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
          {offer.type === 'stage' ? 'Stage' : 'Emploi'}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-subtle">
          <Clock className="h-3 w-3" />
          {offer.deadline ? `Expire le ${new Date(offer.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : 'Postulez dès maintenant'}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h3 className="display text-2xl leading-tight text-ink">
          {offer.title}
        </h3>
        <p className="mt-2 text-base font-medium text-ink-soft">{offer.company}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {offer.filiere && offer.filiere !== '—' && (
            <span className="rounded-lg bg-ink/5 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              {offer.filiere}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-ink/5 pt-6 text-xs text-ink-soft font-medium">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-brand-600" />
          {offer.city}
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold text-brand-700">
          Découvrir
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
