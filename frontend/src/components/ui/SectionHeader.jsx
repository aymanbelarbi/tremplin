export default function SectionHeader({ kicker, title, description, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <span className="kicker">{kicker}</span>}
        <h1 className="display mt-3 text-display-md text-ink">{title}</h1>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
