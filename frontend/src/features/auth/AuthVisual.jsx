import { Briefcase, Check, Printer, Shield } from 'lucide-react'

export default function AuthVisual() {
  return (
    <aside className="relative hidden overflow-hidden rounded-[28px] border border-ink/10 bg-ink p-10 text-paper lg:flex lg:flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-20 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl"
      />

      <div className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-400" />
        Plateforme Tremplin · ISTA Khemisset
      </div>

      <div className="relative mt-auto">
        <p className="display text-3xl leading-tight text-paper">
          Votre passerelle vers l'emploi
        </p>
        <p className="mt-4 text-sm text-paper/60">
          Créez votre CV, postulez aux offres et suivez votre insertion professionnelle.
        </p>
      </div>

      <div className="relative mt-10 grid grid-cols-2 gap-3 text-xs text-paper/70">
        <Highlight icon={Shield} label="Données protégées" />
        <Highlight icon={Briefcase} label="Suivi d'emploi" />
        <Highlight icon={Printer} label="Impression CV" />
        <Highlight icon={Check} label="Candidatures simplifiées" />
      </div>
    </aside>
  )
}

function Highlight({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-paper/10 bg-paper/5 px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-accent-400" />
      <span>{label}</span>
    </div>
  )
}
