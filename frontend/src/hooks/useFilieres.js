import { useQuery } from '@tanstack/react-query'
import { getFilieres } from '@/api/filieres'

export function useFilieres() {
  const query = useQuery({
    queryKey: ['filieres'],
    queryFn: getFilieres,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const rawFilieres = query.data || []

  // Create the flat list matching the old `FILIERES` array
  const filieresList = rawFilieres.map((f) => f.name)

  // Create the grouped list matching the old `FILIERE_GROUPS` array
  // We'll group by `category` (which maps to `parent`)
  const groupsMap = {}
  for (const f of rawFilieres) {
    const parent = f.category || 'Autres'
    if (!groupsMap[parent]) {
      groupsMap[parent] = []
    }
    // The option value and label used to be just the name,
    // but the name already includes the parent in the old format.
    // For dropdown compatibility, we return the exact string.
    groupsMap[parent].push(f.name)
  }

  const filiereGroups = Object.keys(groupsMap).map((parent) => ({
    parent,
    options: groupsMap[parent],
  }))

  return {
    ...query,
    filieresList,
    filiereGroups,
    rawFilieres,
  }
}
