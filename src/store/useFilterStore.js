import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFilterStore = create(
  persist(
    (set) => ({
      tableFilters: {},
      tableSorting: {},
      
      setColumnFilters: (tableId, updater) =>
        set((state) => ({
          tableFilters: {
            ...state.tableFilters,
            [tableId]: typeof updater === 'function' ? updater(state.tableFilters[tableId] || []) : updater,
          },
        })),

      setColumnSorting: (tableId, updater) =>
        set((state) => ({
          tableSorting: {
            ...state.tableSorting,
            [tableId]: typeof updater === 'function' ? updater(state.tableSorting[tableId] || []) : updater,
          },
        })),
        
      clearFilters: (tableId) =>
        set((state) => {
          const newFilters = { ...state.tableFilters }
          delete newFilters[tableId]
          return { tableFilters: newFilters }
        }),

      clearAllTables: () => set({ tableFilters: {}, tableSorting: {} }),
    }),
    {
      name: 'filter-storage',
    }
  )
)
