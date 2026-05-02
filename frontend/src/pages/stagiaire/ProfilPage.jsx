import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Briefcase, Search, Loader2, Camera, X, Lock, Eye, EyeOff } from 'lucide-react'
import { useFilieres } from '@/hooks/useFilieres'
import { toast } from 'sonner'
import { getMyProfile, updateMyProfile, uploadPhoto, deletePhoto, changePassword } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import GroupedSelect from '@/components/ui/GroupedSelect'

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  employment_status: 'looking',
  job_title: '',
  job_company: '',
  job_city: '',
  job_start_date: '',
  city: '',
  birth: '',
  filiere: '',
  promotion: '',
  bio: '',
  loisirs: [],
}

const EMPLOYMENT_BADGE = {
  employed: { tone: 'brand', label: 'Employé' },
  looking: { tone: 'accent', label: 'En recherche' },
}

export default function ProfilPage() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['me', 'profile'],
    queryFn: getMyProfile,
  })
  const { filiereGroups, isLoading: loadingFilieres } = useFilieres()
  const [form, setForm] = useState(EMPTY)
  const [photoUrl, setPhotoUrl] = useState(null) // saved photo from server
  const [pendingPhoto, setPendingPhoto] = useState(null) // file to upload on save
  const [pendingPreview, setPendingPreview] = useState(null) // local preview URL
  const [removePhoto, setRemovePhoto] = useState(false) // flag to delete on save
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [showPwdCurrent, setShowPwdCurrent] = useState(false)
  const [showPwdNew, setShowPwdNew] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)

  const [lastSavedForm, setLastSavedForm] = useState(null)

  useEffect(() => {
    if (!data) return
    const u = data.user || {}
    const p = data.profile || {}
    const initial = {
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      employment_status: p.employment_status || 'looking',
      job_title: p.job_title || '',
      job_company: p.job_company || '',
      job_city: p.job_city || '',
      job_start_date: p.job_start_date || '',
      city: p.city || '',
      birth: p.birth_date || '',
      filiere: p.filiere || '',
      promotion: p.promotion || '',
      bio: p.bio || '',
      loisirs: p.loisirs || [],
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initial)
    setLastSavedForm(initial)
    setPhotoUrl(p.photo_path || null)
    setPendingPhoto(null)
    setPendingPreview(null)
    setRemovePhoto(false)
  }, [data])

  const isDirty = lastSavedForm && (
    JSON.stringify(form) !== JSON.stringify(lastSavedForm) ||
    pendingPhoto !== null ||
    removePhoto === true
  )

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      toast.success('Profil mis à jour.')
      setLastSavedForm(form)
      setPendingPhoto(null)
      setRemovePhoto(false)
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['me', 'cv'] })
      // Sync auth store with updated user data (email, name, etc.)
      if (data?.user) {
        setUser(data.user)
      }
    },
    onError: () => toast.error('Impossible d\'enregistrer.'),
  })

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    try {
      // Handle photo changes first
      if (removePhoto) {
        await deletePhoto()
      } else if (pendingPhoto) {
        await uploadPhoto(pendingPhoto)
      }
      // Then save profile data
      await mutation.mutateAsync({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        employment_status: form.employment_status,
        job_title: form.job_title || null,
        job_company: form.job_company || null,
        job_city: form.job_city || null,
        job_start_date: form.job_start_date || null,
        city: form.city,
        birth_date: form.birth || null,
        filiere: form.filiere,
        promotion: form.promotion || null,
        bio: form.bio,
        loisirs: form.loisirs.length ? form.loisirs : null,
      })
    } catch {
      toast.error("Impossible d'enregistrer.")
    }
  }

  const empBadge = EMPLOYMENT_BADGE[data?.profile?.employment_status] || EMPLOYMENT_BADGE.looking

  const infoOk = Boolean(form.first_name && form.last_name && form.phone)
  const cursusOk = Boolean(form.filiere)
  const empOk = form.employment_status === 'employed' ? Boolean(form.job_title && form.job_company) : true
  const aboutOk = Boolean(form.bio)
  const completionSteps = [infoOk, cursusOk, empOk, aboutOk]
  const completion = Math.round((completionSteps.filter(Boolean).length / completionSteps.length) * 100)

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Espace stagiaire"
        title={<>Mon <span className="display-italic text-brand-600">profil</span></>}
        description="Gardez vos informations à jour — elles sont utilisées pour votre CV et vos candidatures."
        actions={
          <button type="submit" form="profile-form" className="btn-primary" disabled={mutation.isPending || !isDirty}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
        }
      />

      {isLoading && (
        <div className="card flex items-center justify-center gap-2 p-6 text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement du profil…
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="card-raised p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                {pendingPreview ? (
                  <img src={pendingPreview} alt="Aperçu" className="h-20 w-20 rounded-full object-cover object-top" />
                ) : photoUrl && !removePhoto ? (
                  <img src={photoUrl} alt="Photo" className="h-20 w-20 rounded-full object-cover object-top" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-400 text-2xl font-semibold text-ink">
                    {(form.first_name[0] || '') + (form.last_name[0] || '')}
                  </div>
                )}
                {(photoUrl || pendingPreview) && !removePhoto ? (
                  <button
                    type="button"
                    onClick={() => { setRemovePhoto(true); setPendingPhoto(null); setPendingPreview(null) }}
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-red-50 text-red-500 shadow-soft hover:bg-red-100"
                    aria-label="Supprimer la photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-input').click()}
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-paper-card text-ink-soft shadow-soft hover:bg-paper"
                    aria-label="Ajouter une photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input
                  id="photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setPendingPhoto(file)
                    setRemovePhoto(false)
                    const reader = new FileReader()
                    reader.onload = (ev) => setPendingPreview(ev.target.result)
                    reader.readAsDataURL(file)
                    e.target.value = ''
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-ink">{form.first_name} {form.last_name}</p>
                <p className="text-sm text-ink-muted">{form.email}</p>
              </div>
              <Badge tone={empBadge.tone} icon={form.employment_status === 'employed' ? Briefcase : Search}>{empBadge.label}</Badge>
            </div>
          </div>

          <FormSection title="Informations personnelles">
            <Grid>
              <Field label="Prénom">
                <input className="input w-full" placeholder="Yassine" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </Field>
              <Field label="Nom">
                <input className="input w-full" placeholder="El Mansouri" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </Field>
              <Field label="Email">
                <input type="email" className="input w-full" placeholder="yassine@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Téléphone">
                <input
                  type="number"
                  className="input w-full"
                  value={form.phone}
                  onChange={(e) => { const v = e.target.value; setForm({ ...form, phone: v.length > 10 ? v.slice(0, 10) : v }) }}
                  placeholder="06 12 34 56 78"
                />
              </Field>
            </Grid>
          </FormSection>

          <FormSection title="Cursus à l'ISTA">
            <Grid>
              <Field label="Filière">
                <GroupedSelect
                  id="filiere"
                  label=""
                  placeholder={loadingFilieres ? "Chargement..." : "Choisir votre filière"}
                  groups={filiereGroups.map((g) => ({
                    parent: g.parent,
                    options: g.options.map((o) => ({ label: o, value: o })),
                  }))}
                  value={form.filiere || ''}
                  onChange={(v) => setForm({ ...form, filiere: v })}
                />
              </Field>
              <Field label="Promotion">
                <input
                  type="number"
                  className="input w-full"
                  value={form.promotion}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm({ ...form, promotion: v.length > 4 ? v.slice(0, 4) : v })
                  }}
                  placeholder="Ex : 2026"
                  min={2000}
                />
              </Field>
            </Grid>
          </FormSection>

          <FormSection title="Situation professionnelle">
            <Field label="Statut">
              <GroupedSelect
                id="employment_status"
                label=""
                placeholder="Choisir votre statut"
                groups={[
                  {
                    parent: 'Situation',
                    options: [
                      { label: "En recherche d'emploi ou stage", value: 'looking' },
                      { label: "J'ai trouvé un emploi ou stage", value: 'employed' },
                    ],
                  },
                ]}
                value={form.employment_status || ''}
                onChange={(v) => setForm({ ...form, employment_status: v })}
              />
            </Field>
          </FormSection>

          <FormSection title="À propos">
            <Field label="Profil" hint="Une phrase claire sur qui vous êtes et ce que vous cherchez — sera utilisée sur votre CV.">
              <textarea
                rows={4}
                className="input w-full resize-none"
                placeholder="Stagiaire motivé, sérieux et passionné par le développement web..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
          </FormSection>


          <FormSection title="Sécurité">
            <Field label="Mot de passe actuel">
              <div className="relative">
                <input type={showPwdCurrent ? 'text' : 'password'} className="input w-full pr-11" placeholder="Votre mot de passe actuel" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
                <button
                  type="button"
                  onClick={() => setShowPwdCurrent((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
                  aria-label={showPwdCurrent ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwdCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nouveau mot de passe" hint="Minimum 8 caractères.">
                <div className="relative">
                  <input type={showPwdNew ? 'text' : 'password'} className="input w-full pr-11" placeholder="8 caractères minimum" value={pwForm.password} onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => setShowPwdNew((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
                    aria-label={showPwdNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPwdNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Confirmer le mot de passe">
                <div className="relative">
                  <input type={showPwdConfirm ? 'text' : 'password'} className="input w-full pr-11" placeholder="Confirmer le mot de passe" value={pwForm.password_confirmation} onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
                    aria-label={showPwdConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPwdConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={pwLoading || !pwForm.current_password || !pwForm.password || !pwForm.password_confirmation}
                onClick={async () => {
                  if (pwForm.password !== pwForm.password_confirmation) {
                    toast.error('Les mots de passe ne correspondent pas.')
                    return
                  }
                  setPwLoading(true)
                  try {
                    await changePassword(pwForm)
                    toast.success('Mot de passe mis à jour.')
                    setPwForm({ current_password: '', password: '', password_confirmation: '' })
                  } catch (err) {
                    const msg = err?.response?.data?.message || "Impossible de changer le mot de passe."
                    toast.error(msg)
                  } finally {
                    setPwLoading(false)
                  }
                }}
                className="btn-ghost text-sm"
              >
                {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Changer le mot de passe
              </button>
            </div>
          </FormSection>
        </form>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card-raised p-6">
            <p className="kicker">Complétude du profil</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="font-display text-4xl font-medium text-ink">{completion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${completion}%` }} />
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-center justify-between text-ink-soft">
                <span>Informations personnelles</span>
                <Badge tone={infoOk ? 'brand' : 'accent'}>{infoOk ? 'OK' : 'À compléter'}</Badge>
              </li>
              <li className="flex items-center justify-between text-ink-soft">
                <span>Cursus à l'ISTA</span>
                <Badge tone={cursusOk ? 'brand' : 'accent'}>{cursusOk ? 'OK' : 'À compléter'}</Badge>
              </li>
              <li className="flex items-center justify-between text-ink-soft">
                <span>Situation professionnelle</span>
                <Badge tone={empOk ? 'brand' : 'accent'}>{empOk ? 'OK' : 'À compléter'}</Badge>
              </li>
              <li className="flex items-center justify-between text-ink-soft">
                <span>À propos</span>
                <Badge tone={aboutOk ? 'brand' : 'accent'}>{aboutOk ? 'OK' : 'À compléter'}</Badge>
              </li>

            </ul>
          </div>

          <div className="card-ink p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-paper/60">Astuce</p>
            <p className="mt-3 font-display text-lg text-paper">
              Un profil complet multiplie par 3 les réponses positives.
            </p>
            <p className="mt-2 text-sm text-paper/70">
              Ajoutez une photo nette et personnalisez votre présentation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <section className="card-raised p-6">
      <h2 className="display text-xl text-ink">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function Grid({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

function Field({ label, hint, Icon, children }) {
  return (
    <label className="block">
      <span className="label inline-flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-ink-subtle" />}
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-ink-subtle">{hint}</span>}
    </label>
  )
}
