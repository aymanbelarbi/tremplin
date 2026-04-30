// Mock data — shape aligné avec les modèles Laravel côté backend.
// Sera remplacé par des appels API (TanStack Query) dans les phases ultérieures.

export const EMPLOYMENT_LABELS = {
  looking: { label: 'En recherche', tone: 'accent' },
  employed: { label: 'Employé', tone: 'brand' },
}

export const STATUS_LABELS = {
  pending: { label: 'En attente', tone: 'warning' },
  accepted: { label: 'Acceptée', tone: 'success' },
  refused: { label: 'Refusée', tone: 'danger' },
}

