import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Briefcase,
  GraduationCap,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { VILLES } from '@/lib/cities'
import { listAdminOffers, createOffer, updateOffer, deleteOffer } from '@/api/offers'
import { useFilieres } from '@/hooks/useFilieres'
import { normalizeOffer, denormalizeOffer } from '@/lib/normalizers'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import GroupedSelect from '@/components/ui/GroupedSelect'

export default function OffresManagePage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: () => listAdminOffers(),
  })
  const offers = useMemo(() => raw.map(normalizeOffer), [raw])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] })

  const createMut = useMutation({
    mutationFn: createOffer,
    onSuccess: () => { toast.success('Offre publiée.'); invalidate() },
    onError: () => toast.error('Publication impossible.'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateOffer(id, payload),
    onSuccess: () => { toast.success('Offre mise à jour.'); invalidate() },
    onError: () => toast.error('Mise à jour impossible.'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => { toast.success('Offre supprimée.'); invalidate() },
    onError: () => toast.error('Suppression impossible.'),
  })

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      if (type !== 'all' && o.type !== type) return false
      if (query) {
        const q = query.toLowerCase()
        if (!o.title.toLowerCase().includes(q) && !(o.company || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [offers, query, type])

  function handleSave(data) {
    const payload = denormalizeOffer(data)
    if (editing) {
      updateMut.mutate({ id: editing.id, payload })
    } else {
      createMut.mutate(payload)
    }
    setOpen(false)
    setEditing(null)
  }

  function handleDelete(id) {
    if (!confirm('Supprimer cette offre ?')) return
    deleteMut.mutate(id)
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Administration"
        title={<>Gestion des <span className="display-italic text-brand-600">offres</span></>}
        description="Publier, modifier et archiver les offres d'emploi et de stage proposées aux stagiaires."
        actions={
          <button onClick={() => { setEditing(null); setOpen(true) }} className="btn-primary">
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </button>
        }
      />

      <div className="card-raised p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block sm:max-w-sm sm:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une offre…"
              className="input w-full pl-11"
            />
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-ink/5 p-1">
              {[
                { id: 'all', label: 'Tout' },
                { id: 'stage', label: 'Stages' },
                { id: 'emploi', label: 'Emplois' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    type === t.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <Filter className="h-3.5 w-3.5" />
              {filtered.length}
            </span>
          </div>
        </div>
      </div>

      <div className="card-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/5 bg-paper-tint text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                <Th>Offre</Th>
                <Th>Type</Th>
                <Th>Filière</Th>
                <Th>Ville</Th>
                <Th className="text-center">Candidats</Th>
                <Th>Clôture</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={7}><Loader2 className="inline h-4 w-4 animate-spin" /> Chargement…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-ink-muted" colSpan={7}>Aucune offre.</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-tint/50">
                  <Td>
                    <p className="font-semibold text-ink">{o.title}</p>
                    <p className="text-xs text-ink-muted">{o.company}</p>
                  </Td>
                  <Td>
                    <Badge tone={o.type === 'stage' ? 'accent' : 'brand'} icon={o.type === 'stage' ? GraduationCap : Briefcase}>
                      {o.type === 'stage' ? 'Stage' : 'Emploi'}
                    </Badge>
                  </Td>
                  <Td className="text-ink-soft">{o.filiere}</Td>
                  <Td className="text-ink-soft">{o.city}</Td>
                  <Td className="text-center font-semibold text-ink">{o.applicants}</Td>
                  <Td className="text-ink-soft">
                    {o.deadline ? new Date(o.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <IconBtn label="Éditer" onClick={() => { setEditing(o); setOpen(true) }}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                      <IconBtn label="Supprimer" danger onClick={() => handleDelete(o.id)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {open && (
          <OfferModal
            initial={editing}
            onClose={() => { setOpen(false); setEditing(null) }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Th({ children, className = '' }) {
  return <th className={`px-5 py-3 ${className}`}>{children}</th>
}
function Td({ children, className = '' }) {
  return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td>
}

function IconBtn({ children, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-ink/10 transition-colors ${
        danger ? 'text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-700' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function OfferModal({ initial, onClose, onSave }) {
  const { filieresList, filiereGroups, isLoading } = useFilieres()
  const defaultFiliere = filieresList.length > 0 ? filieresList[0] : 'Autres'
  const [form, setForm] = useState(
    initial || {
      title: '',
      type: 'stage',
      company: '',
      filiere: defaultFiliere,
      city: VILLES[0],
      remote: 'Présentiel',
      duration: '3 mois',
      salary: '',
      deadline: '2026-06-01',
      description: '',
    },
  )
  
  // Update filiere when list loads if no initial value
  useEffect(() => {
    if (!initial && form.filiere === 'Autres' && filieresList.length > 0) {
      setForm((f) => ({ ...f, filiere: filieresList[0] }))
    }
  }, [filieresList, initial, form.filiere])

  return (
    <motion.div
      className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen bg-ink/40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="relative w-full max-w-2xl rounded-3xl bg-paper-card p-8 shadow-lift"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="kicker">{initial ? 'Modifier' : 'Nouvelle offre'}</span>
            <h2 className="display mt-2 text-display-md text-ink">
              {initial ? initial.title : 'Publier une offre'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-ink-subtle hover:bg-ink/5 hover:text-ink" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.title || !form.company) {
              toast.error('Titre et entreprise sont obligatoires.')
              return
            }
            onSave(form)
          }}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titre">
              <input className="input w-full" placeholder="Ex: Développeur React" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Entreprise">
              <input className="input w-full" placeholder="Ex: Tech Solutions" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Field label="Type">
              <GroupedSelect
                id="offer-type"
                placeholder="Choisir un type"
                groups={[
                  {
                    parent: 'Type',
                    options: [
                      { label: 'Stage', value: 'stage' },
                      { label: 'Emploi', value: 'emploi' },
                    ],
                  },
                ]}
                value={form.type}
                onChange={(value) => setForm({ ...form, type: value })}
              />
            </Field>
            <Field label="Filière">
              <GroupedSelect
                id="offer-filiere"
                placeholder={isLoading ? 'Chargement...' : 'Choisir une filière'}
                groups={filiereGroups.map((g) => ({
                  parent: g.parent,
                  options: g.options.map((value) => ({ label: value, value })),
                }))}
                value={form.filiere}
                onChange={(value) => setForm({ ...form, filiere: value })}
              />
            </Field>
            <Field label="Ville">
              <GroupedSelect
                id="offer-city"
                placeholder="Choisir une ville"
                groups={[
                  {
                    parent: 'Villes',
                    options: VILLES.map((v) => ({ label: v, value: v })),
                  },
                ]}
                value={form.city}
                onChange={(value) => setForm({ ...form, city: value })}
              />
            </Field>
            <Field label="Dernière date">
              <input type="date" className="input w-full" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
          </div>

          <Field label="Description">
            <textarea rows={4} className="input w-full resize-none" placeholder="Décrivez les responsabilités, compétences requises, avantages..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <div className="flex items-center justify-end gap-2 border-t border-ink/5 pt-5">
            <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
            <button type="submit" className="btn-primary">
              {initial ? 'Enregistrer' : 'Publier'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
