import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function ProtectedRoute({ role, children }) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (token && !user) {
      // Token exists but user missing → stale state, clear it
      useAuthStore.getState().logout()
    }
  }, [token, user])

  if (!token || !user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
