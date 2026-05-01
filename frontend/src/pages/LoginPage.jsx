import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import AuthVisual from '@/features/auth/AuthVisual'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Requis'),
})

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    setLoading(true)
    try {
      const { user, token } = await login(values)
      setAuth({ user, token })
      toast.success(`Bienvenue ${user.full_name}`)
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        const from = location.state?.from?.pathname
        if (from) navigate(from, { replace: true })
        else navigate('/espace/profil', { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Identifiants invalides'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div className="card-raised p-8 sm:p-10 reveal">
          <span className="kicker">Connexion</span>
          <h1 className="display mt-4 text-display-md text-ink">Bienvenue</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Connectez-vous pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="email"
                placeholder="votre@email.ma"
                {...register('email')}
              />
              {errors.email && (
                <p className="helper text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-11"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="helper text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button disabled={loading} className="btn-primary w-full text-base">
              Se connecter
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-xs uppercase tracking-[0.15em] text-ink-subtle">ou</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <Link
            to="/inscription"
            className="btn mt-6 flex w-full items-center justify-center text-ink ring-1 ring-ink/15 bg-white"
          >
            Créer un compte
          </Link>

        </div>

        <AuthVisual />
      </div>
    </div>
  )
}
