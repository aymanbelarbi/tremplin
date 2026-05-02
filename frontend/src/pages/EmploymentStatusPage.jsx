import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Search, ArrowUpRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { updateMyProfile } from '@/api/profile'
import AuthVisual from '@/features/auth/AuthVisual'
import { motion, AnimatePresence } from 'framer-motion'

const schema = z.object({
  employment_status: z.enum(['looking', 'employed']),
  job_title: z.string().optional(),
  job_company: z.string().optional(),
  job_city: z.string().optional(),
  job_start_date: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.employment_status === 'employed') {
    if (!data.job_title || data.job_title.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['job_title'], message: 'Intitulé du poste requis' })
    }
    if (!data.job_company || data.job_company.trim().length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['job_company'], message: 'Entreprise requise' })
    }
  }
})

export default function EmploymentStatusPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user, setAuth } = useAuthStore()
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { employment_status: 'looking' },
  })

  const status = watch('employment_status')

  async function onSubmit(values) {
    setLoading(true)
    try {
      const payload = values.employment_status === 'employed'
        ? values
        : { employment_status: 'looking' }
      const { profile } = await updateMyProfile(payload)
      setAuth({ user: { ...user, profile }, token: useAuthStore.getState().token })
      toast.success('Statut enregistré')
      navigate('/espace/profil', { replace: true })
    } catch (err) {
      const resp = err?.response?.data
      if (resp?.errors) {
        Object.entries(resp.errors).forEach(([field, messages]) => {
          setError(field, { message: messages[0] })
        })
      }
      toast.error(resp?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div className="card-raised p-8 sm:p-10 reveal">
          <span className="kicker">Dernière étape</span>
          <h1 className="display mt-4 text-display-md text-ink">
            Votre situation
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Avez-vous déjà trouvé un emploi ou un stage ?
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer rounded-2xl border-2 p-5 text-center transition-all ${
                  status === 'looking'
                    ? 'border-brand-500 bg-brand/5 ring-2 ring-brand-500/15'
                    : 'border-ink/10 hover:border-ink/20'
                }`}
              >
                <input
                  type="radio"
                  value="looking"
                  className="sr-only"
                  {...register('employment_status')}
                />
                <Search className="mx-auto h-8 w-8 text-brand" />
                <span className="mt-2 block text-sm font-semibold text-ink">
                  Je cherche un emploi ou un stage
                </span>
              </motion.label>

              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer rounded-2xl border-2 p-5 text-center transition-all ${
                  status === 'employed'
                    ? 'border-brand-500 bg-brand/5 ring-2 ring-brand-500/15'
                    : 'border-ink/10 hover:border-ink/20'
                }`}
              >
                <input
                  type="radio"
                  value="employed"
                  className="sr-only"
                  {...register('employment_status')}
                />
                <Briefcase className="mx-auto h-8 w-8 text-brand" />
                <span className="mt-2 block text-sm font-semibold text-ink">
                  J'ai trouvé un emploi ou un stage
                </span>
              </motion.label>
            </div>

            <AnimatePresence>
              {status === 'employed' && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 rounded-2xl border border-ink/10 bg-ink/[0.02] p-5">
                    <p className="text-sm font-medium text-ink-soft">
                      Détails de votre emploi ou stage
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="label">Poste</span>
                        <input
                          className="input w-full"
                          placeholder="Développeur web"
                          {...register('job_title')}
                        />
                        {errors.job_title && (
                          <p className="helper text-red-600">{errors.job_title.message}</p>
                        )}
                      </label>
                      <label className="block">
                        <span className="label">Entreprise</span>
                        <input
                          className="input w-full"
                          placeholder="Nom de l'entreprise"
                          {...register('job_company')}
                        />
                        {errors.job_company && (
                          <p className="helper text-red-600">{errors.job_company.message}</p>
                        )}
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="label">Début</span>
                        <input
                          type="month"
                          className="input w-full"
                          {...register('job_start_date')}
                        />
                        {errors.job_start_date && (
                          <p className="helper text-red-600">{errors.job_start_date.message}</p>
                        )}
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button disabled={loading} className="btn-primary w-full text-base">
              Continuer
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>

        <AuthVisual />
      </div>
    </div>
  )
}
