import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import {
  Users,
  Briefcase,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getStats } from '@/api/admin'

const STATUS_COLORS = {
  accepted: '#0a7a3b',
  pending: '#e2e8de',
  refused: '#0f1411',
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getStats,
  })

  const kpis = [
    {
      label: 'Stagiaires inscrits',
      value: data?.kpis?.stagiaires ?? '—',
      deltaLabel: 'au total',
      Icon: Users,
      tint: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Ont trouvé un emploi',
      value: data?.kpis?.employed ?? '—',
      deltaLabel: `${data?.kpis?.looking ?? 0} en recherche`,
      Icon: Briefcase,
      tint: 'bg-accent-100 text-accent-800',
    },
    {
      label: 'Candidatures reçues',
      value: data?.kpis?.applications ?? '—',
      deltaLabel: 'au total',
      Icon: ClipboardList,
      tint: 'bg-ink/5 text-ink',
    },
    {
      label: 'Offres publiées',
      value: data?.kpis?.offers ?? '—',
      deltaLabel: 'en ligne',
      Icon: Briefcase,
      tint: 'bg-brand-50 text-brand-700',
    },
  ]

  const applications30d = data?.applications_30d ?? []
  const statusMix = [] // Removed status mix
  const employmentByFiliere = data?.employment_by_filiere ?? []
  const recent = data?.recent ?? []
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="kicker">Console administration</span>
          <h1 className="display mt-3 text-display-md text-ink">
            Tableau de <span className="display-italic text-brand-600">bord</span>
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Vue d'ensemble de l'activité sur les 30 derniers jours.
          </p>
        </div>
        <div>
          <Link to="/admin/offres" className="btn-primary">
            <span>Publier une offre</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, deltaLabel, Icon, tint }) => (
          <div key={label} className="card-raised p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                  {label}
                </p>
                <p className="mt-3 font-display text-4xl font-medium tracking-tight text-ink">
                  {value}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-ink-subtle">{deltaLabel}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="card-raised p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="kicker">Candidatures</p>
                <h2 className="display mt-2 text-xl text-ink">
                  Flux sur les 30 derniers jours
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <LegendDot color="#0a7a3b" label="Candidatures" />
              </div>
            </div>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                data={applications30d}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a7a3b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0a7a3b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b4e94e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#b4e94e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#0f141115"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#5d6862', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5d6862', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: '#0f141122', strokeDasharray: 3 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #0f141115',
                    boxShadow:
                      '0 10px 30px -12px rgba(15, 20, 17, 0.18), 0 1px 2px rgba(15,20,17,0.06)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="candidatures"
                  stroke="#0a7a3b"
                  strokeWidth={2}
                  fill="url(#greenGrad)"
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-raised p-6">
          <p className="kicker">Insertion</p>
          <h2 className="display mt-2 text-xl text-ink">
            Statut global
          </h2>
          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Employés</span>
                <span className="font-semibold text-brand-700">{data?.kpis?.employed ?? 0}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/5">
                <div 
                  className="h-full bg-brand-600 transition-all" 
                  style={{ width: data?.kpis?.stagiaires ? `${(data.kpis.employed / data.kpis.stagiaires) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">En recherche</span>
                <span className="font-semibold text-accent-700">{data?.kpis?.looking ?? 0}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/5">
                <div 
                  className="h-full bg-accent-400 transition-all" 
                  style={{ width: data?.kpis?.stagiaires ? `${(data.kpis.looking / data.kpis.stagiaires) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        <div className="card-raised p-6 lg:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="kicker">Emploi</p>
              <h2 className="display mt-2 text-xl text-ink">
                Employés vs en recherche par filière
              </h2>
            </div>
            <span className="chip">{employmentByFiliere.length} filières</span>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={employmentByFiliere}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                barSize={22}
              >
                <CartesianGrid
                  stroke="#0f141115"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="filiere"
                  tick={{ fill: '#5d6862', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5d6862', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#0f141108' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #0f141115',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="employed" fill="#0a7a3b" name="Employés" radius={[6, 6, 0, 0]} />
                <Bar dataKey="looking" fill="#e2e8de" name="En recherche" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-raised flex flex-col p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="kicker">Activité</p>
              <h2 className="display mt-2 text-xl text-ink">Derniers événements</h2>
            </div>
            <Link to="/admin/candidatures" className="btn-ghost px-3 text-xs">
              Voir tout
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-5 space-y-4 text-sm">
            {isLoading && (
              <li className="flex items-center gap-2 text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
              </li>
            )}
            {!isLoading && recent.length === 0 && (
              <li className="text-ink-muted">Aucun événement récent.</li>
            )}
            {recent.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <StatusDot status={r.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{r.name}</p>
                  <p className="truncate text-[12px] text-ink-subtle">
                    {r.role}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-soft">{r.action}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink-subtle">
                  {r.when}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-soft">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

function StatusDot({ status }) {
  const map = {
    pending: { Icon: Circle, cls: 'bg-accent-100 text-accent-800' },
    accepted: { Icon: CheckCircle2, cls: 'bg-brand-100 text-brand-700' },
    refused: { Icon: XCircle, cls: 'bg-ink/5 text-ink-muted' },
    published: { Icon: Briefcase, cls: 'bg-brand-50 text-brand-700' },
  }
  const { Icon, cls } = map[status] || map.pending
  return (
    <span
      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}
