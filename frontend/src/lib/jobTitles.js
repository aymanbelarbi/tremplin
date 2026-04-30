/**
 * Maps filière group names to suggested job titles for the Moroccan market.
 * Used to auto-suggest a "Titre / accroche" in the CV builder.
 */
export const JOB_TITLES = {
  'Développement Digital': [
    'Développeur Web',
    'Développeur Mobile',
    'Développeur Full Stack',
    'Data Analyst',
  ],

  'Gestion des Entreprises': [
    'Gestionnaire Comptable',
    'Assistant de Gestion',
    'Responsable Administratif',
    'Chargé de Clientèle',
  ],
  'Assistant Administratif': [
    'Assistant de Direction',
    'Secrétaire Comptable',
    'Agent Administratif',
    "Chargé d'Accueil",
  ],
  'Electromécanique des Systèmes Automatisées': [
    'Technicien de Maintenance',
    'Électromécanicien',
    'Technicien en Automatismes',
  ],
  'Génie électrique': [
    'Technicien Électricien',
    'Responsable Électrique',
    "Chargé d'Affaires Électricité",
  ],
  'Arts culinaires': [
    'Cuisinier',
    'Chef de Partie',
    'Commis de Cuisine',
  ],
  'Electricité d\'Entretien Industriel': [
    'Électricien Industriel',
    'Technicien de Maintenance Électrique',
  ],
}

/**
 * Given a filière value like "Technicien Spécialisé — Développement Digital option Web Full Stack",
 * return suggested titles based on the main branch.
 */
export function getJobTitlesForFiliere(filiere) {
  if (!filiere) return []
  
  // Find which branch key is contained in the filiere string
  const branchKey = Object.keys(JOB_TITLES).find(key => filiere.includes(key))
  
  return branchKey ? JOB_TITLES[branchKey] : []
}
