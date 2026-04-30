import api from '@/lib/api'

export async function getMyCv() {
  const { data } = await api.get('/v1/me/cv')
  return data.data
}

export async function updateMyCv(payload) {
  const { data } = await api.put('/v1/me/cv', payload)
  return data.data
}
