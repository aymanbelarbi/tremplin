import api from '@/lib/api'

export async function listMyApplications() {
  const { data } = await api.get('/v1/me/applications')
  return data.data
}

export async function applyToOffer(offerId, payload = {}) {
  const { data } = await api.post(`/v1/offers/${offerId}/apply`, payload)
  return data.data
}

export async function listAdminApplications(params = {}) {
  const { data } = await api.get('/v1/admin/applications', { params })
  return data.data
}

export async function decideApplication(id, payload) {
  const { data } = await api.put(`/v1/admin/applications/${id}/decision`, payload)
  return data.data
}
export async function cancelApplication(id) {
  const { data } = await api.delete(`/v1/me/applications/${id}`)
  return data
}
