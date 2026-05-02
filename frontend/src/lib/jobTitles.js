/**
 * Given a filiere name and its category (niveau), return the official job title.
 * e.g. ("Développement Digital option Web Full Stack", "Technicien Spécialisé")
 *   → "Technicien Spécialisé en Développement Digital option Web Full Stack"
 */
export function getOfficialTitle(name, category) {
  if (!name || !category) return ''
  if (category === 'Technicien Spécialisé') {
    return `Technicien Spécialisé en ${name}`
  }
  if (category === 'Technicien') {
    return `Technicien en ${name}`
  }
  if (category === 'Qualifié') {
    return `Qualifié en ${name}`
  }
  return `${category} ${name}`
}

/**
 * Given a filiere value like "Développement Digital option Web Full Stack",
 * return suggested titles based on the filiere branch.
 * Uses the filiereGroups from useFilieres hook to find the category.
 */
export function getSuggestedTitles(filiere, filiereGroups) {
  if (!filiere || !filiereGroups) return []
  // Find the category for this filiere
  const group = filiereGroups.find((g) => g.options.includes(filiere))
  if (!group) return []
  const category = group.parent
  const official = getOfficialTitle(filiere, category)
  // Return the official title + related shorter titles
  const titles = [official]
  // Add the base filiere without "option ..." as a shorter alternative
  const baseName = filiere.split(' option ')[0]
  if (baseName !== filiere) {
    titles.push(getOfficialTitle(baseName, category))
  }
  return titles.filter(Boolean)
}
