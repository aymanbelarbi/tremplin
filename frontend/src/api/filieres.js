import api from '@/lib/api'

export async function getFilieres() {
  const { data } = await api.get('/v1/filieres')
  return data.data
}
