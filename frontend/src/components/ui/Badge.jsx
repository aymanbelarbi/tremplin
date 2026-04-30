import { cn } from '@/lib/cn'

const TONES = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  accent: 'bg-accent-100 text-accent-800 border-accent-200',
  ink: 'bg-ink/5 text-ink-soft border-ink/10',
  paper: 'bg-paper-card text-ink border-ink/10',
  outline: 'bg-transparent text-ink-soft border-ink/15',
}

export default function Badge({ tone = 'ink', className, children, icon: Icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        TONES[tone] || TONES.ink,
        className,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  )
}
