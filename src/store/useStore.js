import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@/services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: async () => {
        try {
          await authAPI.logout()
        } catch (error) {
          console.error('Logout error:', error)
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useUIStore = create(
  persist(
    (set, get) => ({
      sidebarMode: 'full', // 'full' | 'icon' | 'hidden'
      columnVisibility: {},
      columnOrder: [],
      setSidebarMode: (mode) => set({ sidebarMode: mode }),
      setColumnVisibility: (updater) =>
        set((state) => ({
          columnVisibility:
            typeof updater === 'function' ? updater(state.columnVisibility) : updater,
        })),
      setColumnOrder: (updater) =>
        set((state) => ({
          columnOrder: typeof updater === 'function' ? updater(state.columnOrder) : updater,
        })),
      resetTableSettings: () => set({ columnVisibility: {}, columnOrder: [] }),
    }),
    {
      name: 'ui-storage',
    }
  )
)
