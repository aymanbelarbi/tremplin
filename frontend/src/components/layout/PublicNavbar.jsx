import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { LogOut, ArrowUpRight, Menu, X, Home, Briefcase, LayoutDashboard, User } from 'lucide-react'
import { logout as apiLogout } from '@/api/auth'
import { toast } from 'sonner'
import Logo from '@/components/brand/Logo'
import { cn } from '@/lib/cn'
import { motion, AnimatePresence } from 'framer-motion'

export default function PublicNavbar() {
  const { user, token, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const prevPathname = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      prevPathname.current = location.pathname
      setIsOpen(false)
    }
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleLogout() {
    try {
      await apiLogout()
    } catch {
      // ignore
    }
    logout()
    toast.success('Déconnecté')
  }

  const navLinks = [
    ...(user?.role !== 'stagiaire' ? [{ to: '/', label: 'Accueil', Icon: Home }] : []),
    { to: '/offres', label: 'Offres', Icon: Briefcase },
    ...(user && user.role === 'stagiaire'
      ? [{ to: '/espace', label: 'Mon espace', Icon: User }]
      : []),
  ]

  return (
    <div className="sticky top-4 z-50 flex flex-col items-center px-4 mb-4">
      <header
        className={cn(
          'flex w-full max-w-5xl items-center justify-between rounded-full border border-ink/10 bg-paper-card/80 px-3 py-2 backdrop-blur-xl transition-all duration-300',
          scrolled ? 'shadow-lift' : 'shadow-soft',
        )}
      >
        <Link
          to={user?.role === 'stagiaire' ? '/espace/profil' : '/'}
          className="group flex items-center pl-3"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation — same pill style as mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-soft hover:bg-ink/5'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          {token && user?.role === 'stagiaire' && (
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 ml-1">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          )}
          {token && user && user.role !== 'stagiaire' && (
            <Link to="/admin" className={cn(
              'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ml-1',
              location.pathname.startsWith('/admin')
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-soft hover:bg-ink/5'
            )}>
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
          {!token && (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/connexion" className="btn-ghost px-4">
                Connexion
              </Link>
              <Link to="/inscription" className="btn-primary group">
                Inscription
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink overflow-hidden"
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-[calc(100%+8px)] left-4 right-4 z-50 overflow-hidden rounded-3xl border border-ink/10 bg-paper-card/95 p-4 shadow-lift backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-colors',
                    (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-soft hover:bg-ink/5'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}

              {token && user?.role === 'stagiaire' ? (
                <div className="mt-4 border-t border-ink/5 pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                  </button>
                </div>
              ) : token && user ? (
                <div className="mt-4 border-t border-ink/5 pt-4">
                  <Link
                    to="/admin"
                    className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Admin
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/5 pt-4">
                  <Link to="/connexion" className="btn-ghost justify-center px-4 py-3">
                    Connexion
                  </Link>
                  <Link to="/inscription" className="btn-primary justify-center px-4 py-3">
                    Inscription
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
