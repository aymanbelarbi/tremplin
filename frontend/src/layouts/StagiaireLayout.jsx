import { Outlet, NavLink, useLocation } from 'react-router-dom'
import PublicNavbar from '@/components/layout/PublicNavbar'
import { User, FileText, Briefcase, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import PageTransition from '@/components/ui/PageTransition'
import { AnimatePresence } from 'framer-motion'

const links = [
  { to: '/espace/profil', label: 'Profil', Icon: User, hint: 'Infos personnelles' },
  { to: '/espace/cv', label: 'Mon CV', Icon: FileText, hint: 'Éditeur & export' },
  { to: '/espace/candidatures', label: 'Mes candidatures', Icon: Briefcase, hint: 'Suivi & statuts' },
]

export default function StagiaireLayout() {
  const location = useLocation()

  return (
    <div className="relative flex min-h-screen flex-col bg-paper text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-noise opacity-60 mix-blend-multiply"
      />
      <PublicNavbar />
      <div className="relative mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 py-10 md:grid-cols-[260px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="card p-3">
            <div className="px-3 pb-3 pt-2">
              <span className="kicker">Espace stagiaire</span>
              <p className="mt-2 text-sm text-ink-muted">
                Gérez votre profil, votre CV et vos candidatures.
              </p>
            </div>
            <nav className="space-y-1">
              {links.map(({ to, label, Icon, hint }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-ink text-paper'
                        : 'text-ink-soft hover:bg-ink/5',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                          isActive
                            ? 'bg-accent-400 text-ink'
                            : 'bg-ink/5 text-ink-soft group-hover:bg-ink/10',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">
                        <span className="block">{label}</span>
                        <span
                          className={cn(
                            'mt-0.5 block text-[11px]',
                            isActive ? 'text-paper/60' : 'text-ink-subtle',
                          )}
                        >
                          {hint}
                        </span>
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="card-ink mt-4 p-5">
            <Sparkles className="h-5 w-5 text-accent-400" />
            <p className="mt-3 text-sm font-semibold text-paper">
              Plateforme officielle
            </p>
            <p className="mt-1 text-xs text-paper/60">
              ISTA Khemisset · Version 1.0 (2026)
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
