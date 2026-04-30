import { useAuthStore } from '@/stores/authStore'
import { Navigate, useLocation } from 'react-router-dom'

export default function GuestRoute({ children }) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  // If logged in as stagiaire, redirect to dashboard
  // EXCEPT if we are currently in the registration flow
  if (token && user && user.role === 'stagiaire') {
    if (location.pathname.startsWith('/inscription')) {
      return children
    }
    return <Navigate to="/espace" replace />
  }

  return children
}
