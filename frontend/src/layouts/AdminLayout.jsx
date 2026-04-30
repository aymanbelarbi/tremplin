import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  ClipboardList,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { logout as apiLogout } from '@/api/auth'
import { toast } from 'sonner'
import Logo from '@/components/brand/Logo'
import { cn } from '@/lib/cn'
import PageTransition from '@/components/ui/PageTransition'
import { AnimatePresence } from 'framer-motion'

const links = [
  { to: '/admin/dashboard', label: 'Tableau de bord', Icon: LayoutDashboard },
  { to: '/admin/offres', label: 'Offres', Icon: Briefcase },
  { to: '/admin/stagiaires', label: 'Stagiaires', Icon: Users },
  { to: '/admin/candidatures', label: 'Candidatures', Icon: ClipboardList },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    try {
      await apiLogout()
    } catch {
      // ignore
    }
    logout()
    toast.success('Déconnecté')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen bg-paper text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-noise opacity-60 mix-blend-multiply"
      />

      <aside className="relative hidden w-72 shrink-0 flex-col border-r border-ink/10 bg-paper-card/70 p-6 backdrop-blur md:flex">
        <Link to="/admin/dashboard" className="flex items-center">
          <Logo />
        </Link>

        <span className="chip mt-5 w-fit border-brand-200 bg-brand-50 text-brand-700">
          <Shield className="h-3 w-3" /> Console administration
        </span>

        <nav className="mt-8 space-y-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
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
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-accent-400 text-ink'
                        : 'bg-ink/5 text-ink-soft group-hover:bg-ink/10',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="card-ink p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-400 font-semibold text-ink">
                {user?.full_name
                  ?.split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('') || 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-paper">
                  {user?.full_name || 'Administrateur'}
                </p>
                <p className="truncate text-[11px] text-paper/60">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-paper/10 px-3 py-2 text-xs font-semibold text-paper transition-colors hover:bg-paper/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-x-hidden px-6 py-10 md:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
