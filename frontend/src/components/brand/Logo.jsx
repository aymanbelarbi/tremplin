export default function Logo({ className = '', variant = 'dark' }) {
  const ink = variant === 'light' ? '#faf9f5' : '#0f1411'
  const leaf = '#0a7a3b'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 6h24"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 6v22"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M16 17c5-2 9-6 12-11"
          stroke={leaf}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="6" r="2.6" fill={leaf} />
      </svg>
      <span
        className="text-[20px] font-display font-semibold leading-none tracking-tight"
        style={{ color: ink, fontVariationSettings: "'opsz' 40, 'SOFT' 40" }}
      >
        tremplin
      </span>
    </span>
  )
}
