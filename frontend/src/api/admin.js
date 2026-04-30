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

export async function deleteStagiaire(id) {
  await api.delete(`/v1/admin/stagiaires/${id}`)
}

export async function downloadStagiairePdf(id) {
  const response = await api.get(`/v1/admin/stagiaires/${id}/cv/pdf`, {
    responseType: 'blob',
  })
  return response.data
}

export async function addFiliere(payload) {
  const { data } = await api.post('/v1/admin/filieres', payload)
  return data.data
}

export async function deleteFiliere(id) {
  await api.delete(`/v1/admin/filieres/${id}`)
}
