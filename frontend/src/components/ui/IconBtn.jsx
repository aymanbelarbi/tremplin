export default function IconBtn({ children, label, onClick, danger, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-ink-subtle transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'hover:bg-red-50 hover:text-red-600'
          : 'hover:bg-ink/5 hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  )
}
