import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useFilieres } from '@/hooks/useFilieres'
import GroupedSelect from '@/components/ui/GroupedSelect'
import { toast } from 'sonner'
import { register as apiRegister } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import AuthVisual from '@/features/auth/AuthVisual'

const schema = z
  .object({
    first_name: z.string().min(2, 'Prénom requis'),
    last_name: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().length(10, 'Numéro à 10 chiffres requis').regex(/^[0-9]+$/, 'Chiffres uniquement'),
    filiere: z.string().min(1, 'Filière requise'),
    promotion: z
      .number({ invalid_type_error: 'Année invalide' })
      .int('Année invalide')
      .min(2000, 'Année trop ancienne'),
    password: z.string().min(8, 'Min. 8 caractères'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Les mots de passe ne correspondent pas',
  })

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const { filiereGroups, isLoading: loadingFilieres } = useFilieres()

  async function onSubmit(values) {
    setLoading(true)
    try {
      const { user, token } = await apiRegister(values)
      setAuth({ user, token })
      toast.success('Compte créé ')
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/inscription/emploi', { replace: true })
      }
    } catch (err) {
      const resp = err?.response?.data
      if (resp?.errors) {
        Object.entries(resp.errors).forEach(([field, messages]) => {
          setError(field, { message: messages[0] })
        })
      }
      toast.error(resp?.message || 'Inscription impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div className="card-raised p-8 sm:p-10 reveal">
          <span className="kicker">Inscription</span>
          <h1 className="display mt-4 text-display-md text-ink">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Remplissez vos informations pour rejoindre Tremplin.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="first_name">Prénom</label>
              <input
                id="first_name"
                className="input"
                placeholder="Prénom"
                autoComplete="given-name"
                {...register('first_name')}
              />
              {errors.first_name && (
                <p className="helper text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="last_name">Nom</label>
              <input
                id="last_name"
                className="input"
                placeholder="Nom"
                autoComplete="family-name"
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className="helper text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="votre@email.ma"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="helper text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="phone">Téléphone</label>
              <input
                id="phone"
                type="number"
                className="input"
                placeholder="06xxxxxxxx"
                autoComplete="tel"
                onInput={(e) => { if (e.target.value.length > 10) e.target.value = e.target.value.slice(0, 10) }}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="helper text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <GroupedSelect
              id="filiere"
              label="Filière"
              placeholder={loadingFilieres ? "Chargement..." : "Choisir votre filière"}
              groups={filiereGroups.map((g) => ({
                parent: g.parent,
                options: g.options.map((o) => ({ label: o, value: o })),
              }))}
              value={watch('filiere') || ''}
              onChange={(v) => setValue('filiere', v, { shouldValidate: true })}
              error={errors.filiere?.message}
            />

            <div>
              <label className="label" htmlFor="promotion">Promotion</label>
              <input
                id="promotion"
                type="number"
                className="input"
                placeholder="Ex : 2026"
                min={2000}
                maxLength={4}
                onInput={(e) => { if (e.target.value.length > 4) e.target.value = e.target.value.slice(0, 4) }}
                {...register('promotion', { valueAsNumber: true })}
              />
              {errors.promotion && (
                <p className="helper text-red-600">{errors.promotion.message}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
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

            <div>
              <label className="label" htmlFor="password_confirmation">Confirmation</label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  type={showPwdConfirm ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="Confirmer le mot de passe"
                  autoComplete="new-password"
                  {...register('password_confirmation')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwdConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
                  aria-label={showPwdConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwdConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="helper text-red-600">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button disabled={loading} className="btn-primary mt-2 w-full text-base sm:col-span-2">
              Créer un compte
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
            to="/connexion"
            className="btn mt-6 flex w-full items-center justify-center text-ink ring-1 ring-ink/15 bg-white"
          >
            Se connecter
          </Link>
        </div>

        <AuthVisual />
      </div>
    </div>
  )
}
