import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2, BookOpen, AlertCircle, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useFilieres } from '@/hooks/useFilieres'
import { addFiliere, deleteFiliere, updateFiliere } from '@/api/admin'
import SectionHeader from '@/components/ui/SectionHeader'
import IconBtn from '@/components/ui/IconBtn'

export default function FilieresManagePage() {
  const queryClient = useQueryClient()
  const { rawFilieres, isLoading, isError } = useFilieres()
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editId, setEditId] = useState(null)

  const createMutation = useMutation({
    mutationFn: addFiliere,
    onSuccess: () => {
      toast.success('Filière ajoutée')
      setNewName('')
      setNewCategory('')
      queryClient.invalidateQueries({ queryKey: ['filieres'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateFiliere(id, payload),
    onSuccess: () => {
      toast.success('Filière modifiée')
      setEditId(null)
      setNewName('')
      setNewCategory('')
      queryClient.invalidateQueries({ queryKey: ['filieres'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFiliere,
    onSuccess: () => {
      toast.success('Filière supprimée')
      queryClient.invalidateQueries({ queryKey: ['filieres'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!newName.trim()) return

    if (editId) {
      updateMutation.mutate({ id: editId, payload: { name: newName, category: newCategory } })
      return
    }

    createMutation.mutate({ name: newName, category: newCategory })
  }

  function handleDelete(id) {
    if (window.confirm('Supprimer cette filière ?')) {
      deleteMutation.mutate(id)
    }
  }

  function startEdit(filiere) {
    setEditId(filiere.id)
    setNewName(filiere.name)
    setNewCategory(filiere.category || '')
  }

  function cancelEdit() {
    setEditId(null)
    setNewName('')
    setNewCategory('')
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Administration"
        title={<>Gestion des <span className="display-italic text-brand-600">filières</span></>}
        description="Gérez les options de formation disponibles pour les stagiaires et les offres."
      />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* List Section */}
        <div className="min-w-0 flex-1">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-ink/5 bg-paper-tint text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                    <th className="px-5 py-3">Filière</th>
                    <th className="px-5 py-3">Niveau</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {isLoading && (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-ink-muted">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        <p className="mt-2">Chargement...</p>
                      </td>
                    </tr>
                  )}
                  {isError && (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-red-500">
                        <AlertCircle className="mx-auto h-5 w-5" />
                        <p className="mt-2">Erreur de chargement</p>
                      </td>
                    </tr>
                  )}
                  {!isLoading && rawFilieres.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-ink-muted">
                        Aucune filière trouvée.
                      </td>
                    </tr>
                  )}
                  {rawFilieres.map((f) => (
                    <tr key={f.id}>
                      <td className="px-5 py-4 font-medium text-ink">{f.name}</td>
                      <td className="px-5 py-4 text-ink-soft">{f.category || '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <IconBtn label="Modifier" onClick={() => startEdit(f)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </IconBtn>
                          <IconBtn label="Supprimer" danger onClick={() => handleDelete(f.id)} disabled={deleteMutation.isPending}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Form Section */}
        <div className="w-full lg:w-[350px] lg:shrink-0">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="card p-6">
              <h3 className="display text-lg text-ink">
                {editId ? 'Modifier une filière' : 'Ajouter une filière'}
              </h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="label" htmlFor="filiere-name">Nom complet</label>
                  <input
                    id="filiere-name"
                    className="input mt-1.5 w-full"
                    placeholder="Ex: Développement Digital"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="filiere-cat">Niveau</label>
                  <input
                    id="filiere-cat"
                    className="input mt-1.5 w-full"
                    placeholder="Ex: Technicien Spécialisé"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={(editId ? updateMutation.isPending : createMutation.isPending) || !newName.trim()}
                    className="btn-primary w-full"
                  >
                    {(editId ? updateMutation.isPending : createMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {editId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn-secondary w-full"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="card-ink p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400 text-ink">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-lg text-paper">Organisation</p>
              <p className="mt-2 text-sm text-paper/70 leading-relaxed">
                Les filières ajoutées ici apparaîtront immédiatement lors de l'inscription des nouveaux stagiaires et dans les filtres de recherche.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
