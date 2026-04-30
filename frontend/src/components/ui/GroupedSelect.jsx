import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function GroupedSelect({ id, label, placeholder, groups, value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = (() => {
    if (!value) return null
    for (const g of groups) {
      for (const o of g.options) {
        if (o.value === value) return o.label
      }
    }
    return null
  })()

  return (
    <div ref={ref} className="relative">
      {label && <label className="label" htmlFor={id}>{label}</label>}

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`input flex w-full cursor-pointer items-center justify-between text-left ${
          !value ? 'text-ink-subtle' : 'text-ink'
        } ${open ? 'border-brand-500 ring-2 ring-brand-500/15' : ''} ${
          error ? 'border-red-500' : ''
        }`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-ink/10 bg-white shadow-lift">
          {groups.map((g) => (
            <div key={g.parent}>
              <div className="sticky top-0 bg-white px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-subtle">
                {g.parent}
              </div>
              {g.options.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center text-left px-4 py-2.5 text-sm transition-colors hover:bg-brand/5 ${
                    value === o.value ? 'bg-brand/5 font-semibold text-brand-700' : 'text-ink'
                  }`}
                >
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {error && <p className="helper text-red-600">{error}</p>}
    </div>
  )
}
