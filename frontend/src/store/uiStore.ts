import { create } from 'zustand'

interface UIState {
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  recentSearches: string[]
  toggleMobileMenu: () => void
  toggleSearch: () => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  addRecentSearch: (query) => {
    const searches = get().recentSearches.filter((s) => s !== query)
    const updated = [query, ...searches].slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    set({ recentSearches: updated })
  },
  clearRecentSearches: () => {
    localStorage.removeItem('recentSearches')
    set({ recentSearches: [] })
  },
}))
