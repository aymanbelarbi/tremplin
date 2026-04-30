import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function pad(n) { return String(n).padStart(2, '0') }
function fmtDate(y, m, d) { return `${y}-${pad(m)}-${pad(d)}` }

export default function DatePicker({ id, label, placeholder, value, onChange, error, max }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const today = new Date()
  const maxDate = max ? new Date(max) : today

  const parsedValue = value ? new Date(value) : null
  const initialYear = parsedValue && !isNaN(parsedValue) ? parsedValue.getFullYear() : today.getFullYear()
  const initialMonth = parsedValue && !isNaN(parsedValue) ? parsedValue.getMonth() : today.getMonth()

  const [viewYear, setViewYear] = useState(initialYear)
  const [viewMonth, setViewMonth] = useState(initialMonth)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayValue = (() => {
    if (!value) return null
    const d = new Date(value)
    if (isNaN(d)) return null
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
  })()

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const days = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  function isDisabled(day) {
    const date = new Date(viewYear, viewMonth, day)
    return date > maxDate
  }

  function selectDay(day) {
    if (isDisabled(day)) return
    onChange(fmtDate(viewYear, viewMonth + 1, day))
    setOpen(false)
  }

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
        <span>{displayValue || placeholder || 'Choisir une date'}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-ink/10 bg-white p-4 shadow-lift">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-ink">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-subtle">{w}</span>
            ))}
            {days.map((day, i) => (
              day === null ? (
                <span key={`e-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled(day)}
                  onClick={() => selectDay(day)}
                  className={`rounded-lg py-1.5 text-sm transition-colors ${
                    value === fmtDate(viewYear, viewMonth + 1, day)
                      ? 'bg-brand-600 font-semibold text-white'
                      : isDisabled(day)
                        ? 'text-ink-subtle/40 cursor-not-allowed'
                        : 'text-ink hover:bg-brand/5'
                  }`}
                >
                  {day}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {error && <p className="helper text-red-600">{error}</p>}
    </div>
  )
}
