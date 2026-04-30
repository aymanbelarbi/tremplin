import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="display text-display-lg text-brand-600">404</p>
      <h1 className="display mt-2 text-display-md text-ink">
        Page <span className="display-italic">introuvable</span>
      </h1>
      <p className="mt-3 text-ink-muted">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" />
        Retour à l'accueil
      </Link>
    </div>
  )
}
