import api from '@/lib/api'

export async function getMyProfile() {
  const { data } = await api.get('/v1/me/profile')
  return data
}

export async function updateMyProfile(payload) {
  const { data } = await api.put('/v1/me/profile', payload)
  return data
}

export async function uploadPhoto(file) {
  const form = new FormData()
  form.append('photo', file)
  const { data } = await api.post('/v1/me/profile/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deletePhoto() {
  const { data } = await api.delete('/v1/me/profile/photo')
  return data
}

export async function changePassword({ current_password, password, password_confirmation }) {
  const { data } = await api.put('/v1/me/password', {
    current_password,
    password,
    password_confirmation,
  })
  return data
}
