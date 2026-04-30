import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

/**
 * Reusable list editor with add/remove/edit/reorder.
 *
 * @param {string} label - Section title
 * @param {string} hint - Optional hint text
 * @param {Array} items - Array of items
 * @param {Function} onChange - Callback with new array
 * @param {string} addLabel - Text for add button
 * @param {Function} renderItem - (item, index, onChangeItem) => ReactNode
 * @param {Function} createEmpty - () => new empty item
 */
export default function ListEditor({ label, hint, items = [], onChange, addLabel = 'Ajouter', renderItem, createEmpty }) {
  function handleAdd() {
    onChange([...items, createEmpty()])
  }

  function handleRemove(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }

  function handleChange(i, updated) {
    const arr = [...items]
    arr[i] = updated
    onChange(arr)
  }

  function handleMove(i, dir) {
    const arr = [...items]
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    onChange(arr)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        <button type="button" onClick={handleAdd} className="btn-ghost text-xs">
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </button>
      </div>
      {hint && <span className="mt-0.5 block text-[11px] text-ink-subtle">{hint}</span>}

      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-paper-tint p-3">
            <div className="mb-2 flex items-center justify-between text-ink-subtle">
              <div className="flex items-center gap-1">
                <GripVertical className="h-3.5 w-3.5 text-ink-subtle/40" />
                <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} className="rounded p-0.5 hover:bg-ink/5 disabled:opacity-30">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => handleMove(i, 1)} disabled={i === items.length - 1} className="rounded p-0.5 hover:bg-ink/5 disabled:opacity-30">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button type="button" onClick={() => handleRemove(i)} className="rounded-full p-1 text-ink-subtle hover:bg-red-50 hover:text-red-500" aria-label="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {renderItem(item, i, (updated) => handleChange(i, updated))}
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-3 text-center text-sm text-ink-muted">Aucun élément ajouté</p>
        )}
      </div>
    </div>
  )
}
