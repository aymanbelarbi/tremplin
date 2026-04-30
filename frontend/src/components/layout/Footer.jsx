import Logo from '@/components/brand/Logo'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 md:flex-row md:justify-between">
        <Logo />
        <p className="text-xs text-ink-subtle">© {new Date().getFullYear()} Tremplin · ISTA Khemisset</p>
      </div>
    </footer>
  )
}
