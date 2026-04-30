import api from '@/lib/api'

export async function register(payload) {
  const { data } = await api.post('/v1/auth/register', payload)
  return data
}

export async function login(payload) {
  const { data } = await api.post('/v1/auth/login', payload)
  return data
}

export async function logout() {
  await api.post('/v1/auth/logout')
}

export async function me() {
  const { data } = await api.get('/v1/auth/me')
  return data
}
