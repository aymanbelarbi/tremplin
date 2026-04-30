import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'tremplin-auth' },
  ),
)

export const selectIsAuthenticated = (state) => !!state.token
export const selectRole = (state) => state.user?.role ?? null
