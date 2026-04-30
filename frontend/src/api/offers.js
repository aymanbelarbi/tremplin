import api from '@/lib/api'

export async function listPublicOffers(params = {}) {
  const { data } = await api.get('/v1/offers', { params })
  return data.data
}

export async function getPublicOffer(id) {
  const { data } = await api.get(`/v1/offers/${id}`)
  return data.data
}

export async function listAdminOffers(params = {}) {
  const { data } = await api.get('/v1/admin/offers', { params })
  return data.data
}

export async function createOffer(payload) {
  const { data } = await api.post('/v1/admin/offers', payload)
  return data.data
}

export async function updateOffer(id, payload) {
  const { data } = await api.put(`/v1/admin/offers/${id}`, payload)
  return data.data
}

export async function deleteOffer(id) {
  await api.delete(`/v1/admin/offers/${id}`)
}
