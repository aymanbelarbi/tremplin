import api from '@/lib/api'

export async function getStats() {
  const { data } = await api.get('/v1/admin/stats')
  return data
}

export async function listStagiaires(params = {}) {
  const { data } = await api.get('/v1/admin/stagiaires', { params })
  return data.data
}

export async function getStagiaire(id) {
  const { data } = await api.get(`/v1/admin/stagiaires/${id}`)
  return data.data
}
